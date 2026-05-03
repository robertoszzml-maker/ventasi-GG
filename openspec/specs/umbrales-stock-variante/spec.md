## ADDED Requirements

### Requirement: Definir umbrales de stock por variante
Cada variante de artículo (`articulo_variante`) SHALL poder tener tres umbrales de stock opcionales: `stock_minimo`, `stock_seguridad` y `stock_maximo`, todos enteros no negativos. Los tres campos son independientes y opcionales (nullable). Una variante puede tener umbrales definidos parcialmente.

#### Scenario: Guardar umbrales completos en una variante
- **WHEN** se actualizan los tres umbrales de una variante (`stock_minimo`, `stock_seguridad`, `stock_maximo`)
- **THEN** el sistema persiste los valores y los devuelve en la respuesta de la variante

#### Scenario: Guardar umbrales parciales
- **WHEN** se actualiza solo `stock_minimo` de una variante
- **THEN** el sistema persiste solo ese valor; los demás quedan como estaban (null si nunca se definieron)

#### Scenario: Limpiar umbrales de una variante
- **WHEN** se envían los umbrales con valor `null`
- **THEN** el sistema elimina los umbrales y la variante queda en estado SIN_ESTADO

---

### Requirement: Estado semáforo calculado por variante
El sistema SHALL calcular el estado semáforo de cada variante en runtime, comparando el stock actual (suma de `stock_por_ubicacion.cantidad`) contra los umbrales definidos. El estado no se persiste.

Reglas de cálculo:
- `stock_minimo IS NULL` → estado: `SIN_ESTADO`
- `stockActual ≤ stock_minimo` → estado: `ROJO`
- `stockActual > stock_minimo` Y `stockActual ≤ stock_seguridad` → estado: `AMARILLO`
- `stockActual > stock_seguridad` → estado: `VERDE`

Si `stock_seguridad` es null y `stockActual > stock_minimo`, el estado es `VERDE`.

#### Scenario: Variante en estado ROJO
- **WHEN** el stock actual de la variante es igual o menor a `stock_minimo`
- **THEN** el sistema calcula estado `ROJO` para esa variante

#### Scenario: Variante en estado AMARILLO
- **WHEN** el stock actual es mayor a `stock_minimo` y menor o igual a `stock_seguridad`
- **THEN** el sistema calcula estado `AMARILLO`

#### Scenario: Variante en estado VERDE
- **WHEN** el stock actual es mayor a `stock_seguridad` (o mayor a `stock_minimo` si `stock_seguridad` es null)
- **THEN** el sistema calcula estado `VERDE`

#### Scenario: Variante sin umbrales definidos
- **WHEN** `stock_minimo` es null
- **THEN** el sistema devuelve estado `SIN_ESTADO` para esa variante

#### Scenario: Estado semáforo incluido en la grilla de variantes
- **WHEN** se consulta la grilla de un artículo (tab Inventario)
- **THEN** cada celda incluye `stockMinimo`, `stockSeguridad`, `stockMaximo` y `estadoSemaforo`
