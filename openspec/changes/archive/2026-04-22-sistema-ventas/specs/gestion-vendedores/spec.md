## ADDED Requirements

### Requirement: Crear vendedor
El sistema SHALL permitir crear un perfil de vendedor con nombre, apellido, DNI y código interno. El vendedor es independiente del usuario del sistema (login).

#### Scenario: Creación exitosa
- **WHEN** el usuario envía nombre, apellido y código únicos
- **THEN** se crea el vendedor activo y se retorna con id asignado

#### Scenario: Código duplicado
- **WHEN** el usuario envía un código que ya existe en otro vendedor
- **THEN** el sistema retorna error de validación indicando código duplicado

---

### Requirement: Listar vendedores
El sistema SHALL retornar la lista paginada de vendedores con filtro por nombre/apellido y por estado activo/inactivo.

#### Scenario: Listado básico
- **WHEN** se solicita la lista sin filtros
- **THEN** se retornan los vendedores activos paginados

#### Scenario: Filtro por nombre
- **WHEN** se envía parámetro de búsqueda
- **THEN** se retornan vendedores cuyo nombre o apellido contiene el texto

---

### Requirement: Editar vendedor
El sistema SHALL permitir modificar nombre, apellido, DNI, código y estado activo de un vendedor existente.

#### Scenario: Edición exitosa
- **WHEN** el usuario envía datos válidos para un vendedor existente
- **THEN** se actualiza y retorna el vendedor modificado

---

### Requirement: Desactivar vendedor
El sistema SHALL permitir desactivar un vendedor (soft delete). Un vendedor desactivado no aparece en el selector de venta pero sus ventas históricas quedan vinculadas.

#### Scenario: Desactivación exitosa
- **WHEN** el usuario desactiva un vendedor
- **THEN** el vendedor queda con `activo = false` y no aparece en el selector de la pantalla de venta

#### Scenario: Vendedor con ventas no puede ser eliminado físicamente
- **WHEN** el vendedor tiene ventas registradas
- **THEN** el sistema solo permite desactivarlo, no eliminarlo físicamente

---

### Requirement: Selector de vendedor en pantalla de venta
El sistema SHALL ofrecer un selector de vendedor en la pantalla de venta. El selector muestra solo vendedores activos. La sesión puede ser compartida por múltiples vendedores sin re-login.

#### Scenario: Selección de vendedor activo
- **WHEN** el operador abre la pantalla de venta y selecciona un vendedor de la lista
- **THEN** la venta queda asociada a ese vendedor

#### Scenario: Vendedor requerido para confirmar
- **WHEN** el operador intenta confirmar la venta sin seleccionar vendedor
- **THEN** el sistema bloquea la confirmación y muestra error de validación
