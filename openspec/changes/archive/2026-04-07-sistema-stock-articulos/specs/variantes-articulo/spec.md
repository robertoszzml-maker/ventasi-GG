## ADDED Requirements

### Requirement: Grilla talle × color con discriminación potencial/real
El sistema SHALL retornar la grilla completa de combinaciones talle × color para un artículo, discriminando entre variantes reales (tienen registro en articulo_variante) y potenciales (combinación definida en articulo_talle × articulo_color pero sin ingreso aún). También SHALL incluir variantes reales que estén fuera del universo de articulo_talle/articulo_color.

#### Scenario: Artículo con mix de reales y potenciales
- **WHEN** el usuario solicita la grilla de un artículo con algunos ingresos realizados
- **THEN** el sistema retorna todas las combinaciones talle × color con estado 'real' (con cantidad) o 'potencial' (sin registro de variante)

#### Scenario: Artículo sin ningún ingreso
- **WHEN** el usuario solicita la grilla de un artículo recién creado
- **THEN** el sistema retorna todas las combinaciones de articulo_talle × articulo_color con estado 'potencial' y cantidad null

#### Scenario: Variante real fuera del universo talle/color del artículo
- **WHEN** existe una variante cuyo talle o color fue agregado directamente (no por curva/paleta) y luego removido de articulo_talle/articulo_color
- **THEN** el sistema la retorna con estado 'real-extra'

---

### Requirement: Creación lazy de variantes en ingreso
El sistema SHALL crear registros en articulo_variante únicamente cuando se registra un ingreso de mercadería para esa combinación talle × color. Si la variante ya existe, SHALL actualizar su cantidad sumando la nueva.

#### Scenario: Primer ingreso crea variante
- **WHEN** se registra ingreso para artículo/talle/color sin variante existente
- **THEN** el sistema crea el registro en articulo_variante con la cantidad ingresada

#### Scenario: Ingreso posterior suma cantidad
- **WHEN** se registra ingreso para artículo/talle/color con variante ya existente
- **THEN** el sistema actualiza cantidad = cantidad_actual + cantidad_ingresada

#### Scenario: Ingreso con cantidad cero
- **WHEN** el usuario envía cantidad = 0 en el ingreso
- **THEN** el sistema no crea ni modifica la variante para esa combinación

---

### Requirement: Desactivar variante
El sistema SHALL permitir desactivar variantes individualmente sin eliminarlas, preservando el historial.

#### Scenario: Desactivar variante
- **WHEN** el usuario desactiva una variante
- **THEN** el sistema setea activo = 0 en articulo_variante

#### Scenario: Variante desactivada en grilla
- **WHEN** la grilla incluye una variante desactivada
- **THEN** el sistema la muestra con estado 'desactivada' diferenciado visualmente
