## ADDED Requirements

### Requirement: Código de barras propio por variante de artículo
Cada `articulo_variante` SHALL tener un campo `codigo_barras VARCHAR(100) NULL`. Este campo representa el código del proveedor o cualquier código externo asociado a esa combinación talle+color específica. El campo es opcional — su ausencia no impide ninguna operación existente.

#### Scenario: Cargar código de barras del proveedor en una variante
- **WHEN** el operador edita una variante de artículo y completa el campo `codigo_barras`
- **THEN** el sistema persiste el valor y lo devuelve en todas las consultas de esa variante

#### Scenario: Variante sin código de barras del proveedor
- **WHEN** se crea o consulta una variante con `codigo_barras = NULL`
- **THEN** el sistema opera normalmente; el campo devuelve `null` en la respuesta

#### Scenario: Actualizar código de barras existente
- **WHEN** el operador edita el `codigo_barras` de una variante que ya tenía uno
- **THEN** el nuevo valor reemplaza al anterior y se persiste correctamente

---

### Requirement: Auto-generación de código de barras cuando el campo está vacío
El sistema SHALL calcular un código de barras deterministico en runtime cuando `articulo_variante.codigo_barras IS NULL`. El formato SHALL ser `ART{articuloId:04d}T{talleId:03d}C{colorId:03d}` (Code128). Este código NO se persiste en la base de datos — se calcula cada vez que se necesita.

#### Scenario: Código auto-generado para variante sin código de proveedor
- **WHEN** el sistema necesita el código de barras de una variante con `codigo_barras = NULL`
- **THEN** genera deterministicamente `ART0023T004C007` para articuloId=23, talleId=4, colorId=7

#### Scenario: Código auto-generado es siempre el mismo para la misma variante
- **WHEN** se genera el código de barras automático para la misma variante en momentos distintos
- **THEN** el resultado es idéntico (deterministico por ids)

#### Scenario: Código del proveedor tiene precedencia
- **WHEN** una variante tiene `codigo_barras = '7891234560123'`
- **THEN** el sistema usa ese valor y nunca auto-genera para esa variante
