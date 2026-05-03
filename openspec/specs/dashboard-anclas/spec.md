## ADDED Requirements

### Requirement: Listado de artículos ancla con stock por variante
El sistema SHALL proveer un endpoint `GET /articulos/dashboard-anclas` que devuelva todos los artículos con `es_ancla = true`, incluyendo para cada uno sus variantes activas con stock actual, umbrales y estado semáforo calculado.

#### Scenario: Consultar dashboard de anclas
- **WHEN** se solicita `GET /articulos/dashboard-anclas`
- **THEN** el sistema retorna solo artículos con `es_ancla = true`, con sus variantes y estado semáforo por variante

#### Scenario: Sin artículos ancla definidos
- **WHEN** ningún artículo tiene `es_ancla = true`
- **THEN** el sistema retorna un array vacío

#### Scenario: Artículo ancla sin umbrales en sus variantes
- **WHEN** un artículo ancla tiene variantes sin umbrales definidos
- **THEN** esas variantes aparecen con `estadoSemaforo: 'SIN_ESTADO'`

---

### Requirement: Estado agregado por artículo en el dashboard
El sistema SHALL calcular el estado agregado de cada artículo ancla como el estado más crítico entre todas sus variantes, según el orden de prioridad: ROJO > AMARILLO > VERDE > SIN_ESTADO.

#### Scenario: Artículo con al menos una variante en ROJO
- **WHEN** al menos una variante del artículo está en estado ROJO
- **THEN** el artículo muestra estado agregado ROJO

#### Scenario: Artículo con variantes en AMARILLO y VERDE
- **WHEN** ninguna variante está en ROJO, pero al menos una está en AMARILLO
- **THEN** el artículo muestra estado agregado AMARILLO

#### Scenario: Todas las variantes en VERDE
- **WHEN** todas las variantes con umbrales definidos están en VERDE
- **THEN** el artículo muestra estado agregado VERDE

---

### Requirement: Vista de dashboard con filas expandibles por variante
La página de dashboard SHALL mostrar una tabla de artículos ancla donde cada fila es expandible para ver el detalle de stock y semáforo por variante.

#### Scenario: Fila de artículo colapsada
- **WHEN** el usuario ve el dashboard sin expandir ninguna fila
- **THEN** cada artículo muestra: nombre, código, stock total, estado agregado (semáforo)

#### Scenario: Fila de artículo expandida
- **WHEN** el usuario expande una fila de artículo
- **THEN** se muestran las variantes del artículo con columnas: talle, color, stock, mínimo, seguridad, máximo, estado semáforo

#### Scenario: Indicador visual del semáforo
- **WHEN** se muestra el estado de una variante o artículo
- **THEN** ROJO se muestra en rojo, AMARILLO en amarillo, VERDE en verde, SIN_ESTADO en gris neutro
