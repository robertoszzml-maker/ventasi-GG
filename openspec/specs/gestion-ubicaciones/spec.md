## ADDED Requirements

### Requirement: Crear ubicación
El sistema SHALL permitir crear una ubicación con nombre y descripción opcional.

#### Scenario: Creación exitosa
- **WHEN** el usuario envía nombre válido
- **THEN** se crea la ubicación y se retorna con id asignado

#### Scenario: Nombre duplicado
- **WHEN** el usuario envía un nombre ya existente
- **THEN** el sistema retorna error de validación

---

### Requirement: Listar ubicaciones
El sistema SHALL retornar la lista paginada de ubicaciones activas con filtro por nombre.

#### Scenario: Listado básico
- **WHEN** se solicita la lista sin filtros
- **THEN** se retorna la lista paginada de ubicaciones no eliminadas

#### Scenario: Filtro por nombre
- **WHEN** se envía parámetro de búsqueda
- **THEN** se retornan solo las ubicaciones cuyo nombre contiene el texto

---

### Requirement: Editar ubicación
El sistema SHALL permitir modificar el nombre y descripción de una ubicación existente.

#### Scenario: Edición exitosa
- **WHEN** el usuario envía datos válidos para una ubicación existente
- **THEN** se actualiza y retorna la ubicación modificada

---

### Requirement: Eliminar ubicación
El sistema SHALL permitir eliminar (soft delete) una ubicación siempre que no tenga movimientos asociados.

#### Scenario: Eliminación exitosa
- **WHEN** la ubicación no tiene movimientos ni stock
- **THEN** se marca como eliminada y no aparece en listados

#### Scenario: Eliminación bloqueada
- **WHEN** la ubicación tiene movimientos o stock registrado
- **THEN** el sistema retorna error indicando que no se puede eliminar
