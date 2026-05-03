## ADDED Requirements

### Requirement: Cada artículo tiene exactamente un precio por lista
El sistema SHALL mantener la invariante: por cada combinación `(articulo_id, lista_precio_id)` existe exactamente una fila en `articulo_precio`. El par SHALL tener un constraint UNIQUE en la base de datos.

#### Scenario: Se consultan los precios de una lista
- **WHEN** se solicita `GET /lista-precio/:id/precios`
- **THEN** se retorna una fila por cada artículo activo con su precio en esa lista

#### Scenario: Se intenta insertar un precio duplicado
- **WHEN** se intenta crear un `articulo_precio` para un par que ya existe
- **THEN** el backend retorna 409 Conflict o realiza UPSERT según el endpoint

### Requirement: El precio por lista es mayor o igual a cero
El sistema MUST rechazar precios negativos en `articulo_precio`.

#### Scenario: Se intenta guardar un precio negativo
- **WHEN** se envía `precio: -50` para un artículo en una lista
- **THEN** el backend retorna 400 Bad Request

### Requirement: Edición individual de precio en una lista
El sistema SHALL permitir actualizar el precio de un artículo en una lista específica mediante un endpoint individual.

#### Scenario: Edición exitosa de un precio
- **WHEN** se envía `PATCH /articulo-precio/:id` con `precio: 1500.00`
- **THEN** el precio se actualiza y la respuesta retorna el registro actualizado

### Requirement: Edición masiva de precios en una lista
El sistema SHALL proveer un endpoint UPSERT en lote que permita actualizar múltiples precios en una sola operación.

#### Scenario: Actualización masiva exitosa
- **WHEN** se envía `PATCH /articulo-precio/lote` con un array de `[{articuloId, listaPrecioId, precio}]`
- **THEN** todos los precios se actualizan en una sola transacción y se retorna el conteo de filas afectadas

#### Scenario: Un precio inválido en el lote cancela toda la operación
- **WHEN** el array contiene al menos un precio negativo
- **THEN** no se actualiza ningún precio y el backend retorna 400 Bad Request

### Requirement: Aplicar porcentaje masivo sobre artículos seleccionados
El sistema SHALL permitir aplicar un porcentaje de aumento o descuento a un subconjunto de artículos en una lista.

#### Scenario: Aplicar porcentaje a artículos seleccionados
- **WHEN** se envía `PATCH /articulo-precio/aplicar-porcentaje` con `{listaPrecioId, articuloIds: [...], porcentaje: 15}`
- **THEN** los precios de los artículos indicados se recalculan como `precio * (1 + 15/100)` y el resultado no puede ser negativo

### Requirement: Al crear un artículo se generan sus precios en todas las listas
Cuando se crea un artículo, el sistema MUST insertar automáticamente una fila en `articulo_precio` con `precio = 0` para cada lista de precios activa existente.

#### Scenario: Artículo creado cuando existen listas activas
- **WHEN** se crea un artículo y existen 3 listas activas
- **THEN** se generan 3 filas en `articulo_precio` con `precio = 0`

#### Scenario: Artículo creado cuando no hay listas activas
- **WHEN** se crea un artículo y no existen listas activas
- **THEN** no se generan filas en `articulo_precio` y la operación es exitosa
