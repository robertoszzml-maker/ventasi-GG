## Context

El sistema CRM tiene módulos de artículos (con variantes talle×color, stock, listas de precio), clientes, visitas con resolución compra/no-compra y movimientos de inventario. Las "Venta Sí" hoy se resuelven vinculando la visita a un movimiento de inventario (egreso), pero sin ningún dato financiero ni fiscal.

El negocio es textil minorista, RI ante AFIP/ARCA. El punto de venta ARCA ya está configurado. El microservicio `afip-api` existe y tiene autenticación WSAA + consulta de padrón; necesita el módulo `wsfe` para facturación electrónica.

La sesión del sistema puede ser compartida por múltiples vendedores físicos (mostrador), por lo que el vendedor se selecciona en cada venta, no está ligado al login.

## Goals / Non-Goals

**Goals:**
- Pantalla de venta completa: cabecera, artículos, totalizador con IVA, formas de pago múltiples
- Emisión de comprobantes fiscales (ARCA wsfe, CAE) y manuales (numeración interna)
- Impresión via `window.print()` con plantillas A4 y térmica 80mm
- Integración automática con stock al confirmar venta (movimiento de egreso)
- Configuración de métodos de pago con cuotas e intereses (producto cartesiano)
- Datos fiscales en cliente (CUIT, condición IVA) con auto-completado desde padrón ARCA

**Non-Goals:**
- Facturación de exportación en esta fase (tipo E queda como opción pero sin lógica específica)
- Notas de crédito y débito (fase posterior)
- Integración con medios de pago electrónicos (Mercado Pago, POS físico)
- Multi-moneda
- Presupuestos / notas de pedido antes de la venta

## Decisions

### D1: Venta siempre originada en una visita

**Decisión**: La entidad `venta` tiene `visita_id` NOT NULL. No se puede crear una venta sin visita previa.

**Alternativa descartada**: Venta independiente de visita.

**Razón**: El negocio exige medir conversión. Toda venta en el local pasa por el flujo de registro de visita. Si en el futuro se necesitan ventas sin visita (e.g., mayoristas por teléfono), se agrega un tipo de visita "virtual".

---

### D2: Visita.venta_id reemplaza a Visita.movimiento_id en el flujo de venta

**Decisión**: Se agrega `venta_id` a `visita`. El campo `movimiento_id` sigue existiendo pero ya no se usa en el flujo de venta; el movimiento de egreso lo genera la venta al confirmarse.

**Razón**: El movimiento de inventario es una consecuencia de la venta, no su contenedor. La venta tiene la información financiera; el movimiento solo ajusta el stock.

---

### D3: Producto cartesiano método × cuotas en tabla `cuota_metodo_pago`

**Decisión**: Entidad separada `cuota_metodo_pago` con `(metodo_pago_id, cantidad_cuotas)` único y `tasa_interes`.

**Alternativa descartada**: JSON de cuotas dentro de `metodo_pago`.

**Razón**: Permite ABM individual de cuotas, activar/desactivar por cuota, y hacer JOIN directo en la venta para snapshot de tasa al momento del cobro.

---

### D4: Snapshot de precio y tasa en detalle de venta

**Decisión**: `venta_detalle.precio_unitario` y `venta_forma_pago.tasa_interes` guardan el valor al momento de la venta, independientemente de cambios futuros en listas de precio o configuración de cuotas.

**Razón**: Integridad histórica. Un comprobante no puede cambiar retroactivamente.

---

### D5: Comprobante como entidad separada de Venta

**Decisión**: Entidad `comprobante` 1:1 con `venta` (o 1:N si se re-emite). Contiene número, CAE, fecha de emisión, tipo (fiscal/manual) y payload JSON de ARCA.

**Razón**: Una venta puede tener su comprobante anulado y reemitido. Separar permite tener historial sin tocar la venta.

---

### D6: Impresión via window.print() con CSS @media print

**Decisión**: Las plantillas de impresión son componentes React con estilos `@media print`. El usuario presiona imprimir y el browser maneja el diálogo.

**Alternativa descartada**: Generación de PDF en servidor (puppeteer).

**Razón**: Más simple, sin dependencias adicionales en el servidor, funciona offline. El trade-off es que el archivo PDF histórico no se guarda automáticamente — se acepta en esta fase.

---

### D7: Punto de venta ARCA en tabla config

**Decisión**: Claves `ARCA_PUNTO_VENTA` (número), `ARCA_RAZON_SOCIAL` y `IMPRESION_FORMATO_DEFAULT` (`termica`|`a4`) en la tabla `config` existente con `modulo = 'ventas'`.

**Razón**: La tabla config ya existe y soporta configuración por módulo. Evita crear una tabla nueva para pocos valores.

---

### D8: Cliente "Consumidor Final" como entidad real

**Decisión**: Al inicializar el sistema (migración), se crea un cliente con nombre "Consumidor Final", CUIT `00000000000` y condición IVA `CF`. Las ventas a consumidores anónimos usan este registro.

**Razón**: Mantiene la FK `venta.cliente_id` NOT NULL, simplifica la lógica de validación.

---

### D9: IVA 21% fijo para todos los artículos en esta fase

**Decisión**: El campo `alicuota_iva` se agrega a `articulo` con default `'21'`. La lógica de cálculo solo usa 21% por ahora.

**Razón**: El rubro opera con 21% uniforme. El campo existe para futuras alícuotas diferenciales (10.5%, exento) sin migración adicional.

---

### D10: wsfe como MessagePattern en afip-api

**Decisión**: El módulo `wsfe` en `afip-api` expone `solicitar-cae` y `obtener-ultimo-comprobante` como `@MessagePattern`, siguiendo el patrón existente del módulo `padron`.

**Razón**: Consistencia con la arquitectura de microservicio ya establecida. El `api` principal llama a `afip-api` via TCP como ya lo hace para padrón.

## Risks / Trade-offs

**[Riesgo] wsfe en homologación vs producción** → La URL de ARCA wsfe es diferente en homologación y producción. Usar variable de entorno `AFIP_WSFE_URL` configurable. Probar con ambiente de homologación antes de producción.

**[Riesgo] Timeout en FECAESolicitar** → ARCA puede tardar o fallar. La venta queda en estado `pendiente_cae`. El operador puede reintentar sin volver a cargar la venta. Implementar endpoint de reintento.

**[Riesgo] Numeración manual correlativa** → Si dos ventas manuales se crean casi simultáneamente, puede haber colisión de número. Usar transacción con `SELECT ... FOR UPDATE` al obtener el último número.

**[Riesgo] Visita sin cliente asignado** → La pantalla de venta debe detectar si la visita no tiene cliente y forzar la asignación (o usar "Consumidor Final") antes de continuar.

**[Trade-off] window.print() vs PDF servidor** → No hay archivo histórico del PDF. Aceptado en esta fase; si se necesita historial, se agrega generación PDF en el servidor en una fase posterior.

## Migration Plan

1. Ejecutar migración SQL `5.sql`:
   - Tablas: `vendedor`, `metodo_pago`, `cuota_metodo_pago`, `venta`, `venta_detalle`, `venta_forma_pago`, `comprobante`
   - Columnas nuevas: `cliente.cuit`, `cliente.condicion_iva`, `cliente.domicilio`, `cliente.localidad`, `cliente.provincia`, `cliente.codigo_postal`
   - Columnas nuevas: `articulo.alicuota_iva`
   - Columna nueva: `visita.venta_id`
   - Datos iniciales: cliente "Consumidor Final", config de punto de venta placeholder, permisos nuevos
2. Deploy de `afip-api` con módulo `wsfe`
3. Deploy de `api` con módulos nuevos
4. Deploy de `front` con nuevas pantallas

**Rollback**: La migración es aditiva (solo agrega tablas y columnas nullable/con default). Se puede deshacer sin pérdida de datos existentes.

## Open Questions

- ¿El número de punto de venta ARCA es el mismo para todos los locales o cada local tiene el suyo? (Asumido: uno por local, configurable en `config`)
- ¿Se necesita control de caja (apertura/cierre de caja diaria)? No incluido en este change.
- ¿Percepción de IVA e IIBB para clientes RI? No incluido en esta fase.
