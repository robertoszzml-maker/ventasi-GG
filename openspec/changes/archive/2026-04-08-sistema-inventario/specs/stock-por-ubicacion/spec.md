## ADDED Requirements

### Requirement: Consultar stock por artículo y ubicación
El sistema SHALL exponer el stock actual de cada variante (talle+color) de un artículo desglosado por ubicación. El stock SHALL calcularse a partir de la tabla materializada `stock_por_ubicacion`, actualizada en cada movimiento.

#### Scenario: Consulta de stock de un artículo
- **WHEN** se solicita el stock de un artículo
- **THEN** se retorna la lista de variantes con su cantidad por ubicación

#### Scenario: Variante sin stock en una ubicación
- **WHEN** una variante nunca tuvo movimientos en una ubicación
- **THEN** no aparece en el resultado (o aparece con cantidad 0 si se consulta explícitamente)

---

### Requirement: Stock actualizado atómicamente con cada movimiento
El sistema SHALL actualizar `stock_por_ubicacion` dentro de la misma transacción de base de datos que persiste el movimiento. Si la transacción falla, el stock no se modifica.

#### Scenario: Ingreso actualiza stock
- **WHEN** se registra un INGRESO exitoso
- **THEN** el stock de cada variante se incrementa en la ubicación destino

#### Scenario: Egreso actualiza stock
- **WHEN** se registra un EGRESO exitoso
- **THEN** el stock de cada variante se decrementa en la ubicación origen

#### Scenario: Transferencia actualiza ambas ubicaciones
- **WHEN** se registra una TRANSFERENCIA exitosa
- **THEN** el stock se decrementa en la ubicación origen y se incrementa en la ubicación destino, ambos en la misma transacción

#### Scenario: Arreglo actualiza stock al valor nuevo
- **WHEN** se registra un ARREGLO exitoso
- **THEN** el stock de cada variante afectada queda en el valor `cantidad_nueva` indicado

#### Scenario: Fallo en transacción no modifica stock
- **WHEN** el registro del movimiento falla por cualquier motivo
- **THEN** `stock_por_ubicacion` no se modifica

---

### Requirement: Stock no puede ser negativo
El sistema SHALL rechazar cualquier movimiento que deje el stock de una variante en negativo en una ubicación.

#### Scenario: Validación previa al registro
- **WHEN** un EGRESO o TRANSFERENCIA requiere más unidades de las disponibles en la ubicación origen
- **THEN** el sistema retorna error de validación antes de persistir nada
