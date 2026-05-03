## ADDED Requirements

### Requirement: Gestión de colores
El sistema SHALL permitir crear, editar, listar y desactivar colores. Un color puede representar tanto un color sólido (con valor hex) como una trama (sin hex, con descripción textual).

#### Scenario: Crear color sólido
- **WHEN** el usuario envía codigo, nombre y valor hex válido (#RRGGBB)
- **THEN** el sistema crea el color con su representación visual

#### Scenario: Crear trama
- **WHEN** el usuario envía codigo, nombre y descripción sin valor hex
- **THEN** el sistema crea el color con hex = NULL (es una trama)

#### Scenario: Código de color duplicado
- **WHEN** el usuario envía un codigo ya existente
- **THEN** el sistema retorna error de validación por código duplicado

#### Scenario: Listar colores activos
- **WHEN** el usuario solicita la lista de colores
- **THEN** el sistema retorna colores con activo = 1 ordenados por nombre

---

### Requirement: Gestión de paletas de colores
El sistema SHALL permitir crear, editar y gestionar paletas de colores. Una paleta agrupa uno o más colores existentes para su reutilización al crear artículos.

#### Scenario: Crear paleta con colores
- **WHEN** el usuario envía nombre y lista de color_ids válidos
- **THEN** el sistema crea la paleta y sus relaciones en paleta_color_detalle con orden

#### Scenario: Agregar color a paleta existente
- **WHEN** el usuario agrega un color a una paleta
- **THEN** el sistema inserta el nuevo detalle sin afectar los colores existentes

#### Scenario: Eliminar color de paleta
- **WHEN** el usuario elimina un color de una paleta
- **THEN** el sistema elimina solo ese detalle sin afectar artículos ya creados con esa paleta

#### Scenario: Paleta sin colores
- **WHEN** el usuario intenta crear una paleta sin colores
- **THEN** el sistema retorna error: la paleta debe tener al menos un color

#### Scenario: Listar paletas con sus colores
- **WHEN** el usuario solicita la lista de paletas
- **THEN** el sistema retorna cada paleta con el array de colores ordenados por campo orden
