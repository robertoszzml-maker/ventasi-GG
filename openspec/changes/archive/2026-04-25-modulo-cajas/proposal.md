## Why

El sistema tiene un flujo de ventas completo pero no registra quién es responsable del efectivo, no controla la apertura y cierre del cajón, no permite hacer arqueos ni emitir documentos de ajuste (NC/ND). Sin un módulo de cajas no hay trazabilidad del dinero ni cierre contable diario.

## What Changes

- Se crea la tabla `caja`: configuración del único punto de cobro del local.
- Se crea la tabla `sesion_caja`: representa un turno de caja (apertura → cierre). El saldo de efectivo del cierre anterior se arrastra como sugerencia al abrir la siguiente.
- Se crea la tabla `concepto_movimiento`: catálogo configurable de conceptos para movimientos manuales (Retiro, Caja Chica, Pago Luz, etc.).
- Se crea la tabla `movimiento_caja`: cada ingreso o egreso registrado en una sesión. Los movimientos automáticos se generan vía EventEmitter2 al confirmar ventas, NC y ND.
- Se crea la tabla `arqueo_caja` con `arqueo_caja_detalle`: reconciliación por medio de pago (monto sistema vs monto declarado). El arqueo es obligatorio para cerrar una sesión.
- Se modifica la tabla `venta`: se agregan `tipo_operacion` ('venta' | 'nota_credito' | 'nota_debito') y `venta_origen_id` (FK nullable a la venta original corregida). Las NC y ND reutilizan el modelo completo de venta (detalle, cobros, comprobante).
- Se bloquea la creación de ventas cuando no hay sesión de caja abierta.
- Se agrega sección de Cajas al menú del sistema.

## Capabilities

### New Capabilities
- `sesion-caja`: Gestión del ciclo completo de un turno de caja — apertura con saldo inicial (arrastre del cierre anterior), movimientos durante la sesión, arqueo parcial y arqueo de cierre obligatorio. Una sola sesión abierta por vez.
- `movimiento-caja`: Registro de ingresos y egresos de una sesión. Automáticos (venta confirmada, NC emitida, ND emitida) y manuales (retiro, caja chica, otros conceptos configurables). Inmutables una vez registrados.
- `arqueo-caja`: Reconciliación de una sesión por medio de pago. El operador declara los montos físicos; el sistema calcula los esperados y la diferencia. Tipos: PARCIAL (sesión sigue abierta) y CIERRE (cierra la sesión).
- `concepto-movimiento`: ABM de conceptos de movimiento manual de caja. Permite al administrador agregar tipos de egreso o ingreso propios del negocio.
- `nota-credito`: Documento de ajuste a favor del cliente. Mismo modelo que `venta` (detalle de ítems, cobros por medio de pago, comprobante fiscal o no fiscal). Referencia opcional a la venta original. Al emitirse genera un movimiento EGRESO automático en la caja.
- `nota-debito`: Documento de cargo adicional al cliente. Mismo modelo que `venta`. Referencia opcional a la venta original. Al emitirse genera un movimiento INGRESO automático en la caja.

### Modified Capabilities
- `pos-venta-agil`: Se agrega validación de sesión de caja abierta al intentar crear una venta. Si no hay sesión abierta, el POS bloquea con mensaje de acción requerida.
- `pantalla-venta`: Se agrega selector de `tipo_operacion` (Venta / Nota de Crédito / Nota de Débito) al iniciar una operación desde el POS. Para NC y ND se habilita el campo de venta origen.

## Impact

- **Backend**: nuevos módulos NestJS `caja`, `sesion-caja`, `movimiento-caja`, `arqueo-caja`, `concepto-movimiento`, `nota-credito`, `nota-debito`; subscribers EventEmitter2 en `venta` y `nota-credito`/`nota-debito`; modificación de la entidad `Venta` y su servicio.
- **Frontend**: nuevas páginas bajo `/cajas/` (apertura, sesión activa, arqueo, cierre, historial) y `/config/cajas/conceptos`; actualización del POS para guard de sesión y selector de tipo de operación.
- **Base de datos**: migración con nuevas tablas y columnas adicionales en `venta` (`tipo_operacion`, `venta_origen_id`); seed de conceptos de movimiento predeterminados.
- **Sin impacto** en artículos, clientes, stock, listas de precios, proveedores ni integración AFIP directa (los comprobantes NC/ND se integran igual que los de venta).
