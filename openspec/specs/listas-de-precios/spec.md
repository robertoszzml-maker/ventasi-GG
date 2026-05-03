## ADDED Requirements

### Requirement: Listas de precios son globales al sistema
El sistema SHALL mantener un conjunto de listas de precios globales no asociadas a ningún artículo individual. Cada lista tiene nombre único, descripción opcional y estado activo/inactivo.

#### Scenario: Se crea una lista con nombre duplicado
- **WHEN** se intenta crear una lista con un nombre que ya existe
- **THEN** el backend retorna 409 Conflict

#### Scenario: Se listan las listas de precios activas
- **WHEN** se solicita `GET /lista-precio?activo=true`
- **THEN** se retorna solo las listas con `activo = 1`

### Requirement: Exactamente una lista puede ser la lista por defecto
El sistema SHALL garantizar que en todo momento exista exactamente una lista marcada como `es_default = 1`. Al marcar una lista como default, el sistema MUST desmarcar automáticamente la anterior.

#### Scenario: Se marca una lista como default
- **WHEN** se actualiza una lista con `es_default: true`
- **THEN** la lista anterior default pasa a `es_default = 0` y la nueva queda en `es_default = 1`

#### Scenario: Se intenta desactivar la lista default sin designar otra
- **WHEN** se intenta poner `activo = 0` a la única lista marcada como default
- **THEN** el backend retorna 400 Bad Request indicando que debe existir una lista default activa

### Requirement: Al crear una lista se inicializan los precios de todos los artículos activos
Al crear una nueva lista de precios, el sistema MUST generar automáticamente una fila en `articulo_precio` para cada artículo activo existente, usando el modo de inicialización indicado.

#### Scenario: Inicializar en cero
- **WHEN** se crea una lista con `modo: "CERO"`
- **THEN** todos los artículos activos quedan con `precio = 0` en esa lista

#### Scenario: Copiar de otra lista
- **WHEN** se crea una lista con `modo: "COPIAR"` y `listaOrigenId: X`
- **THEN** cada artículo queda con el precio que tenía en la lista X; si no tenía precio en X, queda en 0

#### Scenario: Aplicar porcentaje sobre otra lista
- **WHEN** se crea una lista con `modo: "PORCENTAJE"`, `listaOrigenId: X` y `porcentaje: 20`
- **THEN** cada artículo queda con `precio = precio_en_X * 1.20`, redondeado a 4 decimales

#### Scenario: Calcular desde costo sin permiso
- **WHEN** un usuario sin `ARTICULO_VER_COSTO` intenta crear una lista con `modo: "DESDE_COSTO"`
- **THEN** el backend retorna 403 Forbidden

#### Scenario: Calcular desde costo con permiso
- **WHEN** un usuario con `ARTICULO_VER_COSTO` crea una lista con `modo: "DESDE_COSTO"` y `factor: 2.5`
- **THEN** cada artículo queda con `precio = articulo.costo * 2.5`, redondeado a 4 decimales

### Requirement: El nombre de la lista es único y obligatorio
El sistema MUST validar que el nombre de la lista no esté vacío y sea único entre todas las listas (activas e inactivas).

#### Scenario: Se intenta crear una lista sin nombre
- **WHEN** se envía el payload sin el campo `nombre`
- **THEN** el backend retorna 400 Bad Request
