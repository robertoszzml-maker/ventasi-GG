## ADDED Requirements

### Requirement: Crear artículo con curva y paleta
El sistema SHALL requerir curva_talle y paleta_color al crear un artículo. Al guardar, copia los talles de la curva a articulo_talle y los colores de la paleta a articulo_color. NO crea variantes en este paso.

#### Scenario: Crear artículo exitosamente
- **WHEN** el usuario envía datos del artículo con curva_id y paleta_id válidos
- **THEN** el sistema crea el artículo, copia talles de la curva a articulo_talle, copia colores de la paleta a articulo_color, y no crea ningún registro en articulo_variante

#### Scenario: Crear artículo sin curva
- **WHEN** el usuario envía datos del artículo sin curva_id
- **THEN** el sistema retorna error de validación: la curva es obligatoria

#### Scenario: Crear artículo sin paleta
- **WHEN** el usuario envía datos del artículo sin paleta_id
- **THEN** el sistema retorna error de validación: la paleta es obligatoria

#### Scenario: SKU duplicado
- **WHEN** el usuario envía un SKU ya existente
- **THEN** el sistema retorna error de validación por SKU duplicado

#### Scenario: Código duplicado
- **WHEN** el usuario envía un código interno ya existente
- **THEN** el sistema retorna error de validación por código duplicado

---

### Requirement: Listar artículos sin cartesiano
El sistema SHALL listar artículos mostrando el artículo base con su stock total (suma de variantes) y cantidad de variantes reales. No SHALL exponer cada variante como fila separada.

#### Scenario: Lista de artículos
- **WHEN** el usuario solicita la lista de artículos
- **THEN** el sistema retorna artículos con: id, nombre, sku, codigo_barras, precio, subgrupo, total_variantes (COUNT de articulo_variante), stock_total (SUM de cantidades)

#### Scenario: Artículo sin variantes aún
- **WHEN** un artículo no tiene ingresos realizados
- **THEN** el sistema lo retorna con total_variantes = 0 y stock_total = 0

---

### Requirement: Agregar talle al artículo
El sistema SHALL permitir agregar un talle al artículo que no estaba en la curva original. Al agregar, no crea variantes automáticamente.

#### Scenario: Agregar talle nuevo al artículo
- **WHEN** el usuario agrega un talle no presente en articulo_talle
- **THEN** el sistema inserta en articulo_talle y extiende la grilla potencial del artículo

#### Scenario: Agregar talle ya existente en el artículo
- **WHEN** el usuario intenta agregar un talle que ya está en articulo_talle
- **THEN** el sistema retorna error por duplicado

---

### Requirement: Agregar color al artículo
El sistema SHALL permitir agregar un color al artículo que no estaba en la paleta original. Al agregar, no crea variantes automáticamente.

#### Scenario: Agregar color nuevo al artículo
- **WHEN** el usuario agrega un color no presente en articulo_color
- **THEN** el sistema inserta en articulo_color y extiende la grilla potencial del artículo

#### Scenario: Agregar color ya existente en el artículo
- **WHEN** el usuario intenta agregar un color que ya está en articulo_color
- **THEN** el sistema retorna error por duplicado
