## ADDED Requirements

### Requirement: Gestión de familias
El sistema SHALL permitir crear, editar, listar y desactivar familias de artículos. Una familia es el nivel más alto de la jerarquía de clasificación.

#### Scenario: Crear familia
- **WHEN** el usuario envía nombre de familia
- **THEN** el sistema crea la familia y la retorna con su ID

#### Scenario: Listar familias activas
- **WHEN** el usuario solicita la lista de familias
- **THEN** el sistema retorna solo las familias con activo = 1

#### Scenario: Desactivar familia
- **WHEN** el usuario desactiva una familia
- **THEN** el sistema setea activo = 0 sin eliminar el registro

---

### Requirement: Gestión de grupos
El sistema SHALL permitir crear, editar, listar y desactivar grupos. Un grupo pertenece obligatoriamente a una familia.

#### Scenario: Crear grupo con familia
- **WHEN** el usuario envía nombre y familia_id válido
- **THEN** el sistema crea el grupo asociado a esa familia

#### Scenario: Listar grupos por familia
- **WHEN** el usuario solicita grupos filtrando por familia_id
- **THEN** el sistema retorna solo los grupos de esa familia

#### Scenario: Crear grupo sin familia
- **WHEN** el usuario envía nombre sin familia_id
- **THEN** el sistema retorna error de validación

---

### Requirement: Gestión de subgrupos
El sistema SHALL permitir crear, editar, listar y desactivar subgrupos. Un subgrupo pertenece obligatoriamente a un grupo.

#### Scenario: Crear subgrupo con grupo
- **WHEN** el usuario envía nombre y grupo_id válido
- **THEN** el sistema crea el subgrupo asociado a ese grupo

#### Scenario: Listar subgrupos por grupo
- **WHEN** el usuario solicita subgrupos filtrando por grupo_id
- **THEN** el sistema retorna solo los subgrupos de ese grupo
