## ADDED Requirements

### Requirement: Gestionar características de visitante
El sistema SHALL permitir crear, editar, reordenar y desactivar características de visitante. Cada característica tiene nombre e ícono (seleccionado de un set predefinido en el sistema).

Las características desactivadas NO SHALL aparecer en el formulario de registro de entrada. Las visitas ya registradas con una característica desactivada conservan el vínculo histórico.

#### Scenario: Crear característica
- **WHEN** el usuario ingresa nombre, selecciona ícono y guarda
- **THEN** la característica queda activa y disponible en el formulario de registro

#### Scenario: Nombre duplicado rechazado
- **WHEN** el usuario intenta crear una característica con un nombre ya existente (activo o inactivo)
- **THEN** el sistema retorna error de validación indicando nombre duplicado

#### Scenario: Desactivar característica
- **WHEN** el usuario desactiva una característica existente
- **THEN** deja de aparecer en el selector de registro; las visitas históricas no se modifican

#### Scenario: Reordenar características
- **WHEN** el usuario cambia el orden de una característica
- **THEN** el selector de características en registro refleja el nuevo orden

---

### Requirement: Gestionar razones de no compra
El sistema SHALL permitir crear, editar, reordenar y desactivar razones de no compra. Cada razón puede tener N sub-razones, también editables y reordenables. Debe existir al menos 1 razón activa en todo momento.

Las razones y sub-razones desactivadas NO SHALL aparecer en el formulario de no-compra. Las visitas ya registradas conservan sus referencias históricas.

#### Scenario: Crear razón
- **WHEN** el usuario ingresa un nombre de razón y guarda
- **THEN** la razón queda activa con orden al final de la lista

#### Scenario: Desactivar única razón activa rechazado
- **WHEN** el usuario intenta desactivar la única razón activa
- **THEN** el sistema retorna error indicando que debe existir al menos 1 razón activa

#### Scenario: Crear sub-razón
- **WHEN** el usuario agrega una sub-razón a una razón existente
- **THEN** la sub-razón queda activa y asociada a esa razón

#### Scenario: Sub-razones visibles solo bajo su razón
- **WHEN** el empleado selecciona una razón en el formulario de no-compra
- **THEN** solo se muestran las sub-razones activas de esa razón
