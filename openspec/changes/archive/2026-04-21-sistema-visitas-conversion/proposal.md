## Why

El local no tiene forma de medir cuántas personas entran, cuántas compran y por qué las demás no lo hacen. Sin ese dato, las decisiones de stock, precios y medios de pago son a ciegas.

## What Changes

- Nueva entidad `visita` para registrar cada persona que entra al local con tipo (estático) y características físicas (configurables)
- Flujo operativo de registro: entrada → resolución (compra / no compra)
- Captura estructurada de razones de no compra con sub-razones, artículo de catálogo opcional y observaciones libres
- Las razones y características son configurables por el usuario desde el backoffice
- Dashboard de conversión con métricas por día/semana/mes y cruce por tipo de visitante
- Integración con `movimiento-inventario` existente: una "compra" vincula la visita a un movimiento ubicacion→cliente

## Capabilities

### New Capabilities

- `registro-visitas`: Operativa diaria de registro de entradas y resolución de resultados (compra/no compra) en tiempo real
- `configuracion-visitas`: CRUD de características de visitante y razones de no compra (con sub-razones)
- `dashboard-conversion`: Análisis de tráfico y conversión del local por período, con desglose por razón y tipo de visitante

### Modified Capabilities

- `movimientos-inventario`: La creación de un movimiento desde el flujo de visitas pre-configura procedencia=ubicacion y destino=cliente, vinculando el movimiento a la visita

## Impact

- **Backend**: Nuevos módulos `visita`, `caracteristica-visitante`, `razon-no-compra`
- **Frontend**: Nuevas páginas `/registro-visitas`, `/dashboard/conversion`, `/configuracion/caracteristicas-visitante`, `/configuracion/razones-no-compra`
- **BD**: 5 nuevas tablas: `visita`, `visita_caracteristica`, `caracteristica_visitante`, `razon_no_compra`, `sub_razon_no_compra`
- **Integración**: `movimiento-inventario` recibe campo opcional `visita_id` para vincular ventas al flujo de visitas
