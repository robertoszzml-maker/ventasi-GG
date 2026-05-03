## ADDED Requirements

### Requirement: Gestión de talles
El sistema SHALL permitir crear, editar, listar y desactivar talles. Cada talle tiene un campo orden para controlar la secuencia de visualización en la grilla.

#### Scenario: Crear talle con orden
- **WHEN** el usuario envía codigo, nombre y valor de orden
- **THEN** el sistema crea el talle con ese orden de visualización

#### Scenario: Código de talle duplicado
- **WHEN** el usuario envía un codigo ya existente
- **THEN** el sistema retorna error de validación por código duplicado

#### Scenario: Listar talles activos ordenados
- **WHEN** el usuario solicita la lista de talles
- **THEN** el sistema retorna talles con activo = 1 ordenados por campo orden ASC

---

### Requirement: Gestión de curvas de talles
El sistema SHALL permitir crear, editar y gestionar curvas de talles. Una curva agrupa talles existentes con un orden específico para su reutilización como plantilla al crear artículos e ingresos.

#### Scenario: Crear curva con talles
- **WHEN** el usuario envía nombre y lista de talle_ids válidos con orden
- **THEN** el sistema crea la curva y sus relaciones en curva_talle_detalle

#### Scenario: Curva de talle único
- **WHEN** el usuario crea una curva con un solo talle
- **THEN** el sistema la crea normalmente (talle único es un caso válido)

#### Scenario: Agregar talle a curva existente
- **WHEN** el usuario agrega un talle a una curva
- **THEN** el sistema inserta el nuevo detalle sin afectar artículos ya creados con esa curva

#### Scenario: Curva sin talles
- **WHEN** el usuario intenta crear una curva sin talles
- **THEN** el sistema retorna error: la curva debe tener al menos un talle

#### Scenario: Listar curvas con sus talles
- **WHEN** el usuario solicita la lista de curvas
- **THEN** el sistema retorna cada curva con el array de talles ordenados por campo orden
