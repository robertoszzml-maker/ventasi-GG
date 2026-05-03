## ADDED Requirements

### Requirement: Artículo tiene campo costo protegido por permisos
El campo `costo` SHALL existir en la entidad `articulo` como dato interno y sensible. El backend MUST omitir el campo `costo` de toda respuesta si el usuario autenticado no posee el permiso `ARTICULO_VER_COSTO`. El frontend MUST ocultar el campo costo si el usuario no tiene ese permiso.

#### Scenario: Usuario sin permiso consulta un artículo
- **WHEN** un usuario sin `ARTICULO_VER_COSTO` solicita `GET /articulos/:id`
- **THEN** la respuesta no contiene el campo `costo`

#### Scenario: Usuario con permiso consulta un artículo
- **WHEN** un usuario con `ARTICULO_VER_COSTO` solicita `GET /articulos/:id`
- **THEN** la respuesta contiene el campo `costo` con su valor real

### Requirement: Edición del costo requiere permiso separado
El backend MUST rechazar cualquier payload que incluya el campo `costo` si el usuario no posee `ARTICULO_EDITAR_COSTO`, incluso si tiene `ARTICULO_VER_COSTO`.

#### Scenario: Usuario sin permiso editar intenta modificar el costo
- **WHEN** un usuario sin `ARTICULO_EDITAR_COSTO` envía `PATCH /articulos/:id` con `costo` en el body
- **THEN** la respuesta es 403 Forbidden

#### Scenario: Usuario con permiso editar modifica el costo
- **WHEN** un usuario con `ARTICULO_EDITAR_COSTO` envía `PATCH /articulos/:id` con `costo: 1500.00`
- **THEN** el costo se actualiza correctamente y la respuesta retorna el artículo con el nuevo costo

### Requirement: El formulario de artículo muestra el costo según permisos
El frontend MUST mostrar el campo costo en los formularios de crear y editar artículo únicamente si el usuario tiene `ARTICULO_VER_COSTO`. El campo SHALL ser editable solo si tiene adicionalmente `ARTICULO_EDITAR_COSTO`.

#### Scenario: Usuario sin permiso ver abre formulario de artículo
- **WHEN** el usuario sin `ARTICULO_VER_COSTO` abre el formulario de artículo
- **THEN** el campo costo no está visible en el formulario

#### Scenario: Usuario con permiso ver pero sin permiso editar abre formulario
- **WHEN** el usuario con `ARTICULO_VER_COSTO` pero sin `ARTICULO_EDITAR_COSTO` abre el formulario
- **THEN** el campo costo es visible pero está deshabilitado (solo lectura)

#### Scenario: Usuario con ambos permisos abre formulario
- **WHEN** el usuario con `ARTICULO_VER_COSTO` y `ARTICULO_EDITAR_COSTO` abre el formulario
- **THEN** el campo costo es visible y editable

### Requirement: Costo válido es mayor o igual a cero
El backend MUST rechazar valores negativos para el campo `costo`.

#### Scenario: Se intenta guardar un costo negativo
- **WHEN** se envía `costo: -100` en el body
- **THEN** la respuesta es 400 Bad Request con mensaje de validación
