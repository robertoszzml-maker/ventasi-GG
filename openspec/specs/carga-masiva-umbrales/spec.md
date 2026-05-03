## ADDED Requirements

### Requirement: Atajo A — aplicar umbrales a todas las variantes de un artículo
El sistema SHALL proveer un endpoint que aplique los mismos valores de `stock_minimo`, `stock_seguridad` y `stock_maximo` a todas las variantes activas de un artículo en una sola operación atómica. Esto permite al usuario definir umbrales base sin editar cada variante individualmente.

#### Scenario: Aplicar umbrales a todas las variantes
- **WHEN** se envía `POST /articulo-variante/bulk-umbrales` con `articuloId`, `stockMinimo`, `stockSeguridad`, `stockMaximo`
- **THEN** el sistema actualiza los tres umbrales en todas las variantes activas del artículo en una única transacción

#### Scenario: Artículo sin variantes activas
- **WHEN** se envía el endpoint con un `articuloId` que no tiene variantes activas
- **THEN** el sistema retorna éxito sin modificar nada

#### Scenario: Fallo parcial revierte todo
- **WHEN** la actualización falla para alguna variante
- **THEN** ninguna variante es modificada (transacción completa)

#### Scenario: Aplicar umbrales parciales en bloque
- **WHEN** se envían solo algunos umbrales (por ejemplo, solo `stockMinimo`)
- **THEN** el sistema actualiza solo los campos enviados en todas las variantes; los demás campos no cambian

---

### Requirement: Atajo B — copiar umbrales de una variante a las demás
El sistema SHALL proveer un endpoint que copie los umbrales de una variante origen a todas las demás variantes activas del mismo artículo, en una sola operación atómica. La variante origen no se modifica.

#### Scenario: Copiar umbrales a variantes hermanas
- **WHEN** se envía `POST /articulo-variante/:id/copiar-umbrales`
- **THEN** el sistema copia `stock_minimo`, `stock_seguridad` y `stock_maximo` de la variante `:id` a todas las demás variantes activas del mismo artículo

#### Scenario: Variante origen sin umbrales definidos
- **WHEN** la variante origen tiene todos los umbrales en null
- **THEN** el sistema copia null a todas las demás variantes (limpiando sus umbrales)

#### Scenario: Artículo con una sola variante
- **WHEN** el artículo tiene solo una variante activa (la misma que la origen)
- **THEN** el sistema retorna éxito sin modificar nada
