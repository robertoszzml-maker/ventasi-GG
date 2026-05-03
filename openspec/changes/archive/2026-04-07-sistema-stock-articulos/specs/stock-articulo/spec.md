## ADDED Requirements

### Requirement: Stock por variante
El sistema SHALL llevar el stock de forma individual por cada variante (combinación talle × color). El campo cantidad en articulo_variante es el único registro de stock.

#### Scenario: Consultar stock de variante
- **WHEN** el usuario consulta una variante específica
- **THEN** el sistema retorna la cantidad actual de esa variante

#### Scenario: Stock de variante no creada
- **WHEN** se consulta stock de una combinación sin ingreso
- **THEN** el sistema retorna cantidad = 0 (variante potencial, no existe registro)

---

### Requirement: Stock total calculado del artículo
El sistema SHALL calcular el stock total del artículo como la suma de cantidades de todas sus variantes activas. Este valor no se almacena, se calcula en la query.

#### Scenario: Stock total con variantes
- **WHEN** el usuario solicita el stock total de un artículo
- **THEN** el sistema retorna SUM(articulo_variante.cantidad) WHERE articulo_id = :id AND activo = 1

#### Scenario: Stock total sin variantes
- **WHEN** el artículo no tiene variantes reales creadas aún
- **THEN** el sistema retorna stock_total = 0

---

### Requirement: Ajuste manual de stock por variante
El sistema SHALL permitir ajustar manualmente la cantidad de una variante existente (corrección de inventario).

#### Scenario: Ajuste de cantidad
- **WHEN** el usuario ingresa una nueva cantidad para una variante
- **THEN** el sistema actualiza directamente el campo cantidad con el nuevo valor

#### Scenario: Ajuste a cero
- **WHEN** el usuario ajusta la cantidad a 0
- **THEN** el sistema actualiza cantidad = 0 sin desactivar la variante
