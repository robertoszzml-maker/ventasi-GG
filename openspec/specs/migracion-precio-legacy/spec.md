## ADDED Requirements

### Requirement: El campo legacy articulo.precio se migra a la lista Precio General
El sistema SHALL ejecutar una migración SQL que cree la lista "Precio General" como default, copie los valores de `articulo.precio` a `articulo_precio`, y elimine la columna `precio` de la tabla `articulo`.

#### Scenario: Migración ejecutada correctamente
- **WHEN** se ejecuta la migración 4.sql
- **THEN** existe una lista "Precio General" con `es_default = 1`
- **THEN** cada artículo tiene una fila en `articulo_precio` con el valor que tenía en `articulo.precio`
- **THEN** la columna `precio` no existe más en la tabla `articulo`

#### Scenario: Artículo con precio 0 en la migración
- **WHEN** un artículo tenía `precio = 0` antes de la migración
- **THEN** su fila en `articulo_precio` para "Precio General" tiene `precio = 0`

### Requirement: La migración es atómica
La migración MUST ejecutarse dentro de una transacción. Si algún paso falla, el estado de la base de datos MUST quedar igual que antes de ejecutarla.

#### Scenario: Fallo durante la migración
- **WHEN** la migración falla en el paso de INSERT INTO articulo_precio
- **THEN** la tabla `articulo` conserva la columna `precio` y la tabla `lista_precio` no tiene filas nuevas

## REMOVED Requirements

### Requirement: articulo.precio como campo directo del artículo
**Reason:** Reemplazado por el sistema de listas de precios. El campo único `precio` no permite múltiples precios por canal de venta y no escala al modelo de listas.
**Migration:** Los valores existentes se migran automáticamente a `articulo_precio` con `lista_precio_id` correspondiente a la lista "Precio General". Todo acceso al precio de un artículo MUST realizarse a través de `articulo_precio` filtrando por la lista deseada.
