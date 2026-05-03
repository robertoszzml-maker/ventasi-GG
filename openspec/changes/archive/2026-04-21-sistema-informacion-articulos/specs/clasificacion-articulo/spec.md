## ADDED Requirements

### Requirement: Tipo de continuidad del artículo
El artículo SHALL tener un campo `tipo_continuidad` con valores posibles `'continuidad'` (producto disponible todo el año) o `'temporada'` (producto estacional). Los dos valores son mutuamente excluyentes; un artículo no puede tener ambos simultáneamente. El campo es opcional al crear el artículo.

#### Scenario: Crear artículo con tipo continuidad
- **WHEN** se crea o edita un artículo con `tipo_continuidad: 'continuidad'`
- **THEN** el sistema persiste el valor y lo devuelve en la respuesta

#### Scenario: Crear artículo con tipo temporada
- **WHEN** se crea o edita un artículo con `tipo_continuidad: 'temporada'`
- **THEN** el sistema persiste el valor y lo devuelve en la respuesta

#### Scenario: Valor inválido de tipo continuidad
- **WHEN** se envía un valor distinto de `'continuidad'` o `'temporada'`
- **THEN** el sistema retorna error de validación 400

#### Scenario: Artículo sin tipo de continuidad definido
- **WHEN** se crea un artículo sin especificar `tipo_continuidad`
- **THEN** el campo queda en `null` y no aplica restricción alguna

---

### Requirement: Marcado de artículo como ancla
El artículo SHALL tener un campo booleano `es_ancla` que indica si es un producto estratégico que requiere control prioritario. El valor por defecto es `false`. El campo `es_ancla` es independiente de `tipo_continuidad` — cualquier artículo puede ser ancla independientemente de su tipo.

#### Scenario: Marcar artículo como ancla
- **WHEN** se edita un artículo con `es_ancla: true`
- **THEN** el sistema persiste el valor y el artículo aparece en el dashboard de anclas

#### Scenario: Desmarcar artículo como ancla
- **WHEN** se edita un artículo con `es_ancla: false`
- **THEN** el artículo deja de aparecer en el dashboard de anclas

#### Scenario: Artículo de temporada puede ser ancla
- **WHEN** un artículo tiene `tipo_continuidad: 'temporada'` y `es_ancla: true`
- **THEN** el sistema acepta la combinación sin error
