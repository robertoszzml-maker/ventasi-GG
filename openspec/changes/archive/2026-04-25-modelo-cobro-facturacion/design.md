## Context

El sistema tiene un módulo `metodo-pago` con tres tablas (`metodo_pago`, `cuota_metodo_pago`, `venta_forma_pago`) que cubre el caso básico de seleccionar un método y registrar cuotas con tasa de interés. No hay datos en producción. El objetivo estratégico es integrar el POS (Clover, MercadoPago) y alimentar los módulos futuros de Cobranzas (conciliación, proyección de cash flow) y Caja (sesiones, arqueo). El modelo actual no captura los datos técnicos que esos módulos necesitarán (código de autorización, últimos 4, procesador, estado de acreditación) y no soporta el flujo operacional de código rápido.

## Goals / Non-Goals

**Goals:**
- Reemplazar el modelo de pagos por `medio_pago` + `cobro` con soporte de pagos mixtos.
- Capturar datos técnicos del POS desde el primer registro (autorización, últimos 4, procesador).
- Preparar columnas en `venta` para los módulos de Caja y Cobranzas sin implementarlos.
- Soportar el flujo operacional de código rápido (Andrea teclea "V3" + monto + Enter).
- Mantener consistencia con las convenciones del proyecto (fechas como VARCHAR, no JSON en DB).

**Non-Goals:**
- Integración API con Clover o MercadoPago (v1 es ingreso manual del código de autorización).
- Módulo de Caja: apertura, arqueo, cierre (las columnas se crean; la lógica no).
- Módulo de Cobranzas: conciliación, proyección, alertas (los campos `arancel` y `plazo_dias` se crean vacíos).
- Devoluciones y contracargos (se modelarán como ventas negativas en una entrega futura).

## Decisions

### D1 — Reemplazo limpio (Opción C) en lugar de evolucionar el modelo existente

Se eliminan `metodo_pago`, `cuota_metodo_pago` y `venta_forma_pago` completos. No hay migración de datos porque no hay registros en producción.

**Alternativas consideradas:**
- _Evolucionar_: agregar columnas a las tablas existentes. Descartado porque el modelo de `cuota_metodo_pago` (1 método N planes) es incompatible con el modelo de código rápido (1 fila por variante); mantener ambos genera código de compatibilidad sin valor.
- _Coexistir_: deprecar gradualmente. Descartado porque sin datos históricos no hay nada que preservar.

### D2 — Modelo plano de MedioPago (una fila por variante operacional)

`V1`, `V3`, `V6`, `VD` son filas distintas en `medio_pago`, no un método + plan de cuotas. El campo `codigo` identifica unívocamente la variante operacional.

**Alternativas consideradas:**
- _Modelo normalizado_: `medio_pago` con N cuotas en tabla hija. Descartado porque en el POS físico cada combinación marca/cuotas/procesador es un botón distinto; el modelo plano mapea 1:1 con esa realidad y simplifica la UI de botones rápidos.

### D3 — Redundancia histórica intencional en Cobro

Los campos `tipo`, `cuotas`, `marca_tarjeta` y `procesador` se copian del `medio_pago` al `cobro` en el momento del registro. Si el medio cambia a futuro, el histórico no se altera.

**Alternativas consideradas:**
- _Solo FK_: el cobro guarda únicamente `medio_pago_id`. Descartado porque impide conciliar correctamente si el medio se modifica (cambia procesador, se desactiva, o se reemplaza por código nuevo).

### D4 — timestamp del Cobro como VARCHAR(100)

Consistente con la convención del proyecto documentada en el skill `manejo-fechas`: fechas de negocio como strings, zona horaria manejada vía helper `getTodayDateTime()`. El campo `created_at` de auditoría (heredado de `BaseEntity`) ya existe y se llena automáticamente.

El `timestamp` del cobro es un dato de negocio distinto de `created_at`: representa cuándo ocurrió el pago físicamente. En v1 se inicializa con `getTodayDateTime()`; en la integración con el POS se sobrescribirá con el timestamp que devuelva el procesador.

**Alternativas consideradas:**
- _DATETIME(6)_: tipo nativo de MySQL. Descartado por romper la convención del proyecto y generar inconsistencia con el resto de fechas de negocio.

### D5 — terminal_id y sesion_caja_id como INT nullable sin FK constraint

Las tablas `terminal` y `sesion_caja` no existen aún. Las columnas se crean como enteros nullable sin constraint de clave foránea. Cuando los módulos de Caja se implementen, se agregan las tablas y los constraints en nuevas migraciones sin alterar datos.

**Alternativas consideradas:**
- _Crear tablas mínimas ahora_: genera tablas vacías sin lógica. Descartado porque el valor real de las FK es la consistencia referencial en tiempo de escritura; sin el módulo de Caja no hay nadie que inserte registros válidos en esas tablas.

### D6 — codigo_autorizacion obligatorio solo para CREDITO y DEBITO

En v1, el código lo tipea Andrea manualmente después de que el POS imprime el voucher. Para EFECTIVO, QR y TRANSFERENCIA no hay código de autorización.

La validación se implementa en el backend (DTO + service): si `tipo IN (CREDITO, DEBITO)` y `codigo_autorizacion` es null, el cobro se rechaza.

### D7 — Sin campo retenciones en v1

No se usa JSON en base de datos (regla del proyecto). Cuando llegue el módulo de Cobranzas, se crea una tabla `retencion_medio_pago` con columnas tipadas. En v1 `medio_pago` solo tiene `arancel VARCHAR(20) NULL` y `plazo_dias INT NULL`.

## Risks / Trade-offs

- **[Riesgo] terminal_id sin FK puede almacenar IDs inválidos** → Mitigación: el módulo de Caja validará integridad al implementarse; en v1 la columna siempre queda en NULL.
- **[Riesgo] codigo_autorizacion manual puede omitirse o ingresarse incorrectamente** → Mitigación: la validación backend rechaza cobros con tarjeta sin código; la integración POS en v2 eliminará el ingreso manual.
- **[Trade-off] Modelo plano genera más filas en medio_pago** → A cambio, la UI de botones rápidos y el selector por código son triviales de implementar.
- **[Trade-off] Redundancia en Cobro ocupa más espacio** → A cambio, el histórico es inmutable sin necesidad de snapshots adicionales.

## Migration Plan

1. Ejecutar migración SQL:
   - DROP: `venta_forma_pago`, `cuota_metodo_pago`, `metodo_pago`.
   - CREATE: `medio_pago`, `cobro`.
   - ALTER `venta`: agregar `usuario_id`, `vuelto`, `terminal_id`, `sesion_caja_id`.
   - SEED: insertar los 15 medios de la carga inicial.
2. Eliminar el módulo NestJS `metodo-pago` del backend.
3. Crear módulos `medio-pago` y `cobro`.
4. Actualizar entidad `Venta` y su servicio.
5. Actualizar el frontend del panel de cobros.

**Rollback**: Al no haber datos en producción, rollback = revertir la migración SQL y el código. Sin pérdida de datos.

## Open Questions

- ¿El `orden` de visualización de los botones rápidos lo administra Andrea desde un ABM, o se define fijo en el seed inicial y se cambia por migración?
- ¿La validación de `suma(cobros) = total` debe tener tolerancia de centavos por redondeo, o debe ser exacta?
