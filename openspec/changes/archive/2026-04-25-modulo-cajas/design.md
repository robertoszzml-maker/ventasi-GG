## Context

El sistema ya tiene un flujo de ventas completo con `venta`, `venta_detalle`, `cobro` y `comprobante`. El cambio `modelo-cobro-facturacion` (en progreso) ya plantó `sesion_caja_id` y `terminal_id` en `venta` como FKs nullable anticipando este módulo. EventEmitter2 ya está en el stack para eventos internos.

## Goals / Non-Goals

**Goals:**
- Gestión completa del turno de caja: apertura, movimientos, arqueo y cierre.
- NC y ND como extensión natural del modelo `venta` (mismo flujo, mismo POS).
- Movimientos automáticos al confirmar ventas, NC y ND vía eventos.
- Arrastre del saldo de efectivo del cierre anterior a la apertura siguiente.
- Bloqueo del POS cuando no hay sesión abierta.

**Non-Goals:**
- Multi-caja o multi-sucursal.
- Integración bancaria o conciliación externa.
- Desglose por denominaciones (billetes/monedas) en el arqueo.
- Cierre automático programado.

## Decisions

### D1 — NC/ND como `tipo_operacion` en la tabla `venta`

**Decisión**: agregar `tipo_operacion` ('venta' | 'nota_credito' | 'nota_debito') y `venta_origen_id` a la tabla `venta` en lugar de crear tablas separadas `nota_credito` y `nota_debito`.

**Alternativa descartada**: tablas independientes `nota_credito` y `nota_debito` que replican el esquema de venta.

**Rationale**: NC y ND son estructuralmente idénticas a ventas (mismos ítems, mismos cobros, mismo comprobante, mismo POS). Duplicar el modelo introduce deuda de mantenimiento sin beneficio. Con el discriminador `tipo_operacion` el módulo NestJS, los hooks React Query y las páginas CRUD son los mismos con mínimas variaciones.

---

### D2 — Movimientos de caja vía EventEmitter2

**Decisión**: el módulo `sesion-caja` escucha eventos `venta.confirmada` emitidos por el servicio de ventas. Al recibirlos crea un `movimiento_caja` por cada `cobro` de la venta, usando el `medio_pago_id` del cobro.

**Alternativa descartada**: llamada directa desde `VentaService` a `MovimientoCajaService`.

**Rationale**: el acoplamiento directo viola la separación de responsabilidades. Con EventEmitter2 el módulo de ventas no sabe nada del módulo de cajas. El patrón ya existe en el proyecto (subscribers TypeORM + EventEmitter2).

---

### D3 — Una sesión abierta por vez: constraint en BD + guard en servicio

**Decisión**: constraint a nivel de servicio (query `WHERE estado='abierta' LIMIT 1` antes de abrir) más índice parcial en `sesion_caja(estado)` para performance. No se usa unique constraint condicional de MySQL porque MySQL <8 no lo soporta de forma idiomática.

**Rationale**: garantía en la capa de aplicación es suficiente dado que el sistema es monousuario-por-turno.

---

### D4 — Arrastre de saldo: columnas en `sesion_caja`

**Decisión**: `sesion_caja` tiene `saldo_inicial_sugerido` (calculado del cierre anterior) y `saldo_inicial_confirmado` (ingresado por el operador al abrir). El sistema busca el último arqueo de cierre con `medio_pago` tipo `efectivo` para calcular el sugerido.

**Rationale**: guardar el sugerido permite auditar la diferencia entre lo que el sistema esperaba y lo que el operador declaró al abrir.

---

### D5 — Módulos NestJS separados por entidad

**Decisión**: módulos independientes: `caja`, `sesion-caja`, `movimiento-caja`, `arqueo-caja`, `concepto-movimiento`. No un módulo monolítico `cajas`.

**Rationale**: sigue la convención del proyecto (un módulo por entidad principal). Permite importar solo lo necesario y facilita testing.

## Risks / Trade-offs

- **Migración de `venta` con datos en producción** → La columna `tipo_operacion` se agrega con DEFAULT 'venta', por lo que todos los registros existentes quedan correctos automáticamente. Riesgo bajo.
- **Ventas sin sesión de caja (datos históricos)** → `sesion_caja_id` en `venta` es nullable (ya plantado). Las ventas anteriores no tienen sesión asociada, lo cual es correcto. El bloqueo aplica solo hacia adelante.
- **Evento `venta.confirmada` sin sesión abierta** → Si por algún motivo se confirma una venta sin sesión (migración, admin), el listener debe manejar el caso gracefully (log de warning, no excepción).
- **Concurrencia en arqueo** → El sistema es de operador único por turno; la concurrencia no es un riesgo práctico.

## Migration Plan

1. Ejecutar migración SQL (`7.sql`): crear tablas `caja`, `sesion_caja`, `concepto_movimiento`, `movimiento_caja`, `arqueo_caja`, `arqueo_caja_detalle`; agregar columnas `tipo_operacion` y `venta_origen_id` a `venta`.
2. Seed de conceptos de movimiento predeterminados (Retiro, Caja Chica, Ajuste, Otro).
3. Deploy backend: nuevos módulos, subscriber EventEmitter2.
4. Deploy frontend: páginas de cajas, actualización del POS.
5. Rollback: las columnas nuevas en `venta` son nullable/con default; se pueden ignorar sin romper nada. Las tablas nuevas se pueden truncar o dropear.

## Open Questions

- ¿Los conceptos de movimiento tienen un tipo fijo (INGRESO/EGRESO) o el operador elige al registrar? **Decisión pendiente**: por ahora el concepto define el tipo por defecto pero el operador puede cambiarlo al registrar el movimiento.
- ¿El POS diferencia visualmente el modo NC/ND del modo Venta o es la misma pantalla con un selector? **Decisión pendiente**: misma pantalla con selector de `tipo_operacion` en el header.
