## ADDED Requirements

### Requirement: Crear cliente
El sistema SHALL permitir crear un cliente con nombre, email y teléfono opcionales.

#### Scenario: Creación exitosa
- **WHEN** el usuario envía nombre válido
- **THEN** se crea el cliente y se retorna con id asignado

---

### Requirement: Listar clientes
El sistema SHALL retornar la lista paginada de clientes activos con filtro por nombre.

#### Scenario: Listado básico
- **WHEN** se solicita la lista sin filtros
- **THEN** se retorna la lista paginada de clientes no eliminados

#### Scenario: Filtro por nombre
- **WHEN** se envía parámetro de búsqueda
- **THEN** se retornan clientes cuyo nombre contiene el texto

---

### Requirement: Editar cliente
El sistema SHALL permitir modificar los campos de un cliente existente.

#### Scenario: Edición exitosa
- **WHEN** el usuario envía datos válidos para un cliente existente
- **THEN** se actualiza y retorna el cliente modificado

---

### Requirement: Eliminar cliente
El sistema SHALL permitir eliminar (soft delete) un cliente sin movimientos asociados.

#### Scenario: Eliminación exitosa
- **WHEN** el cliente no tiene movimientos asociados
- **THEN** se marca como eliminado y no aparece en listados

#### Scenario: Eliminación bloqueada
- **WHEN** el cliente tiene movimientos registrados
- **THEN** el sistema retorna error indicando que no se puede eliminar
