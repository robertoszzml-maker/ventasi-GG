## MODIFIED Requirements

### Requirement: Crear cliente
El sistema SHALL permitir crear un cliente con nombre, email y teléfono opcionales, y opcionalmente con datos fiscales: CUIT, condición IVA (`RI` | `CF` | `MONO` | `EXENTO` | `NO_RESP`), domicilio, localidad, provincia y código postal. Si se ingresa CUIT, el sistema SHALL ofrecer auto-completado de datos fiscales consultando el padrón ARCA.

#### Scenario: Creación exitosa sin datos fiscales
- **WHEN** el usuario envía nombre válido sin datos fiscales
- **THEN** se crea el cliente y se retorna con id asignado, campos fiscales en null

#### Scenario: Creación con CUIT y auto-completado de padrón
- **WHEN** el usuario ingresa un CUIT válido en el formulario
- **THEN** el sistema consulta el padrón ARCA y pre-completa razón social, condición IVA y domicilio

#### Scenario: CUIT duplicado
- **WHEN** el usuario envía un CUIT que ya existe en otro cliente activo
- **THEN** el sistema retorna error de validación indicando CUIT duplicado

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
El sistema SHALL permitir modificar todos los campos de un cliente existente incluyendo los datos fiscales.

#### Scenario: Edición exitosa
- **WHEN** el usuario envía datos válidos para un cliente existente
- **THEN** se actualiza y retorna el cliente modificado

---

### Requirement: Eliminar cliente
El sistema SHALL permitir eliminar (soft delete) un cliente sin ventas ni movimientos asociados.

#### Scenario: Eliminación exitosa
- **WHEN** el cliente no tiene ventas ni movimientos asociados
- **THEN** se marca como eliminado y no aparece en listados

#### Scenario: Eliminación bloqueada por venta
- **WHEN** el cliente tiene ventas registradas
- **THEN** el sistema retorna error indicando que no se puede eliminar
