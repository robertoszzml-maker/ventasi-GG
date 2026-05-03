## ADDED Requirements

### Requirement: Crear proveedor
El sistema SHALL permitir crear un proveedor con nombre, CUIT, teléfono y email opcionales.

#### Scenario: Creación exitosa
- **WHEN** el usuario envía nombre válido
- **THEN** se crea el proveedor y se retorna con id asignado

#### Scenario: CUIT duplicado
- **WHEN** el usuario envía un CUIT ya registrado
- **THEN** el sistema retorna error de validación

---

### Requirement: Listar proveedores
El sistema SHALL retornar la lista paginada de proveedores activos con filtro por nombre o CUIT.

#### Scenario: Listado básico
- **WHEN** se solicita la lista sin filtros
- **THEN** se retorna la lista paginada de proveedores no eliminados

#### Scenario: Filtro por nombre o CUIT
- **WHEN** se envía parámetro de búsqueda
- **THEN** se retornan proveedores cuyo nombre o CUIT contiene el texto

---

### Requirement: Editar proveedor
El sistema SHALL permitir modificar todos los campos de un proveedor existente.

#### Scenario: Edición exitosa
- **WHEN** el usuario envía datos válidos para un proveedor existente
- **THEN** se actualiza y retorna el proveedor modificado

---

### Requirement: Eliminar proveedor
El sistema SHALL permitir eliminar (soft delete) un proveedor sin movimientos asociados.

#### Scenario: Eliminación exitosa
- **WHEN** el proveedor no tiene movimientos asociados
- **THEN** se marca como eliminado y no aparece en listados

#### Scenario: Eliminación bloqueada
- **WHEN** el proveedor tiene movimientos registrados
- **THEN** el sistema retorna error indicando que no se puede eliminar
