## Why

El módulo de facturación actual modela los pagos con `metodo_pago + cuota_metodo_pago + venta_forma_pago`, una estructura que no captura datos técnicos del cobro (autorización, últimos 4, procesador), no soporta pagos mixtos de forma idiomática, y no puede integrarse con el POS ni alimentar los futuros módulos de Cobranzas y Caja sin rehacerse. Se reemplaza completamente por un modelo de `medio_pago` + `cobro` diseñado para durar.

## What Changes

- **BREAKING** — Se eliminan las tablas `metodo_pago`, `cuota_metodo_pago` y `venta_forma_pago`, junto con el módulo NestJS `metodo-pago`.
- Se crea la tabla `medio_pago`: catálogo de medios con código rápido (2-4 chars), tipo, cuotas, marca de tarjeta, procesador y campos reservados para Cobranzas (`arancel`, `plazo_dias`).
- Se crea la tabla `cobro`: cada registro representa un pago realizado con un medio. Una `venta` tiene N cobros. Captura redundancia histórica intencional (tipo, cuotas, marca, procesador copiados al momento del cobro), datos técnicos (código de autorización, últimos 4), timestamp preciso y estado.
- Se modifica `venta`: se agrega `usuario_id` (FK obligatoria al operador logueado), `vuelto`, `terminal_id` y `sesion_caja_id` (columnas nullable para conectar con módulo Caja en el futuro).
- Carga inicial de 15 medios de pago predefinidos (EF, V1, V3, V6, V12, VD, M1, M3, M6, MD, A1, N3, MPQ, MPP, TR).
- Se actualiza la pantalla de venta: selector de medio por código rápido, grilla de botones, panel de cobros con monto restante y validación para habilitar el cierre.

## Capabilities

### New Capabilities
- `medios-de-pago`: Catálogo de medios de pago con código rápido, tipo, marca, procesador, orden de visualización y campos futuros para Cobranzas. Incluye ABM y endpoint de búsqueda por código.
- `cobros`: Registro transaccional de pagos por venta. Soporte de pagos mixtos (N cobros por venta), redundancia histórica, datos técnicos del POS, estado de acreditación.

### Modified Capabilities
- `metodos-pago-cuotas`: Reemplazado en su totalidad por `medios-de-pago` y `cobros`. Los requirements anteriores quedan anulados.
- `pos-venta-agil`: La sección de selección de método de pago se reemplaza por el nuevo flujo de cobros con código rápido, botones rápidos y panel de monto restante.

## Impact

- **Backend**: eliminación del módulo `metodo-pago`; nuevos módulos `medio-pago` y `cobro`; actualización de la entidad `Venta` y su servicio (validación suma cobros = total al cerrar).
- **Frontend**: actualización del panel de cobros en `/ventas/nueva`; nuevo selector de medio por código; grilla de botones rápidos ordenada por `orden`.
- **Base de datos**: migración destructiva (DROP + CREATE); seed de medios iniciales.
- **Sin impacto** en comprobantes, detalles de venta, clientes, vendedores, artículos ni stock.
