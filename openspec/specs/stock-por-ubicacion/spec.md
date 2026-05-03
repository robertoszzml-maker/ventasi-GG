## ADDED Requirements

### Requirement: Stock por variante como base del semáforo de umbrales
El stock actual de una variante, calculado como la suma de `stock_por_ubicacion.cantidad` para todas las ubicaciones de esa variante, SHALL ser el valor de referencia para calcular el estado semáforo contra los umbrales definidos en `articulo_variante`. Este cálculo se realiza en el servicio de variantes, no en `stock_por_ubicacion` directamente.

#### Scenario: Stock de variante alimenta el semáforo
- **WHEN** se consulta la grilla de inventario o el dashboard de anclas
- **THEN** el stock usado para comparar contra los umbrales es la suma de todas las `stock_por_ubicacion.cantidad` de la variante
