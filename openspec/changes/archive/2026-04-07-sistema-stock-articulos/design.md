## Context

El sistema CRM Pintegralco no cuenta actualmente con un módulo de stock. Se necesita construir desde cero un sistema para gestión de artículos de indumentaria con variantes multidimensionales (talle × color).

El modelo de negocio es el típico de indumentaria: un artículo tiene un único precio, SKU y código de barras (objeto comercial), pero su stock se lleva por cada combinación talle + color (objeto logístico). Los maestros de talles y colores son configurables por el usuario, y se agrupan en curvas de talles y paletas de colores para acelerar la carga.

## Goals / Non-Goals

**Goals:**
- Modelo de datos limpio que separe objeto comercial (artículo) de objeto logístico (variante)
- Variantes creadas de forma lazy (solo al primer ingreso), no al crear el artículo
- Grilla talle × color con discriminación visual potencial vs real
- Maestros completamente configurables: colores, talles, paletas, curvas, familia/grupo/subgrupo
- Extensibilidad: agregar talles/colores al artículo fuera de la curva/paleta original
- Base preparada para módulo de ingresos de mercadería futuro

**Non-Goals:**
- Módulo de ingresos de mercadería (se define el modelo, no la operación completa)
- Movimientos de stock / trazabilidad de movimientos
- Múltiples depósitos / ubicaciones
- Precios por variante
- Código de barras por variante
- Imágenes de artículos

## Decisions

### D1: Variantes creadas de forma lazy (en ingreso, no en creación de artículo)

**Decisión**: `articulo_variante` solo se crea cuando se realiza el primer ingreso para esa combinación talle × color.

**Alternativa descartada**: Crear todas las variantes N×M al guardar el artículo con `cantidad = 0`.

**Razón**: Evita registros "fantasma" (combinaciones que nunca van a tener stock). El artículo define su universo de talles/colores a través de `articulo_talle` y `articulo_color`, y la grilla usa un LEFT JOIN para mostrar potenciales vs reales. Además, alinea mejor con el flujo operativo futuro: los ingresos son la operación que materializa el stock.

---

### D2: El artículo tiene sus propias tablas de talles y colores (no depende de la curva/paleta)

**Decisión**: Al crear el artículo se copian los talles de la curva a `articulo_talle` y los colores de la paleta a `articulo_color`. Estas tablas son la fuente de verdad.

**Alternativa descartada**: Que el artículo referencie directamente `curva_id` y `paleta_id` y los joins naveguen a través de las tablas de detalle de curva/paleta.

**Razón**: Si se modifica o elimina una curva/paleta, el artículo no debe verse afectado. Las tablas propias (`articulo_talle`, `articulo_color`) permiten agregar talles/colores adicionales al artículo sin modificar la curva/paleta original. Además simplifican las queries de grilla.

`curva_id` y `paleta_id` quedan en `articulo` como referencia histórica (FK `SET NULL`) y como helper para futuros ingresos (plantilla de distribución).

---

### D3: Stock total del artículo calculado, no almacenado

**Decisión**: No existe columna `stock_total` en `articulo`. Se calcula con `SUM(articulo_variante.cantidad)` en las queries de listado.

**Razón**: Evita inconsistencias por doble escritura. El stock por variante es la única fuente de verdad. El total es siempre derivado.

---

### D4: Precio, SKU y código de barras en el artículo, no en la variante

**Decisión**: Estos campos pertenecen al artículo base, no a las variantes individuales.

**Razón**: En indumentaria estándar el precio no varía por talle/color (un pantalón XL no cuesta más que un S en este modelo). El código de barras identifica el artículo; al escanear se busca el artículo y luego se selecciona la variante manualmente. Esto simplifica la operación de punto de venta para negocios pequeños/medianos.

**Implicancia futura**: Si se necesita código de barras por variante para automatizar depósito/POS, se agrega el campo en `articulo_variante` sin romper el modelo actual.

---

### D5: Jerarquía de clasificación propia (no reutiliza módulo existente)

**Decisión**: Se crean tablas propias `familia`, `grupo`, `subgrupo` específicas para artículos.

**Razón**: La clasificación de artículos es un dominio específico con su propia semántica. No es análoga a la clasificación de usuarios/roles existente.

## Modelo de datos

```
familia
  id, nombre, activo

grupo
  id, familia_id, nombre, activo

subgrupo
  id, grupo_id, nombre, activo

color
  id, codigo (UNIQUE), nombre, descripcion, hex (nullable), activo

paleta_color
  id, nombre, descripcion, activo

paleta_color_detalle
  id, paleta_id → paleta_color, color_id → color, orden
  UNIQUE(paleta_id, color_id)

talle
  id, codigo (UNIQUE), nombre, orden, activo

curva_talle
  id, nombre, descripcion, activo

curva_talle_detalle
  id, curva_id → curva_talle, talle_id → talle, orden
  UNIQUE(curva_id, talle_id)

articulo
  id, subgrupo_id → subgrupo
  nombre, descripcion, codigo (UNIQUE), sku (UNIQUE)
  codigo_barras, codigo_qr
  precio DECIMAL(15,2)
  paleta_id → paleta_color (SET NULL)   ← referencia histórica
  curva_id  → curva_talle  (SET NULL)   ← referencia histórica + helper ingresos
  activo, created_at, updated_at

articulo_talle
  id, articulo_id → articulo, talle_id → talle, orden
  UNIQUE(articulo_id, talle_id)

articulo_color
  id, articulo_id → articulo, color_id → color, orden
  UNIQUE(articulo_id, color_id)

articulo_variante
  id, articulo_id → articulo, talle_id → talle, color_id → color
  cantidad INT DEFAULT 0
  activo
  UNIQUE(articulo_id, talle_id, color_id)
```

## Query principal: grilla talle × color

```sql
-- Combinaciones definidas en el artículo (potencial + real)
SELECT
  t.nombre AS talle, at2.orden AS talle_orden,
  c.nombre AS color, ac.orden AS color_orden,
  v.id AS variante_id, v.cantidad,
  CASE WHEN v.id IS NULL THEN 'potencial' ELSE 'real' END AS estado
FROM articulo_talle at2
JOIN talle t ON t.id = at2.talle_id
JOIN articulo_color ac ON ac.articulo_id = at2.articulo_id
JOIN color c ON c.id = ac.color_id
LEFT JOIN articulo_variante v
  ON v.articulo_id = at2.articulo_id
  AND v.talle_id = t.id
  AND v.color_id = c.id
WHERE at2.articulo_id = :id

UNION ALL

-- Variantes reales fuera del universo curva/paleta
SELECT
  t.nombre, 999, c.nombre, 999,
  v.id, v.cantidad, 'real-extra'
FROM articulo_variante v
JOIN talle t ON t.id = v.talle_id
JOIN color c ON c.id = v.color_id
WHERE v.articulo_id = :id
  AND v.activo = 1
  AND v.talle_id NOT IN (SELECT talle_id FROM articulo_talle WHERE articulo_id = :id)
  AND v.color_id NOT IN (SELECT color_id FROM articulo_color WHERE articulo_id = :id)

ORDER BY talle_orden, color_orden
```

## Flujo de creación de artículo

```
1. Usuario selecciona: subgrupo + curva_talle + paleta_color + datos del artículo
2. Backend crea registro en `articulo`
3. Backend copia talles de la curva:
   INSERT INTO articulo_talle (articulo_id, talle_id, orden)
   SELECT :articuloId, talle_id, orden FROM curva_talle_detalle WHERE curva_id = :curvaId
4. Backend copia colores de la paleta:
   INSERT INTO articulo_color (articulo_id, color_id, orden)
   SELECT :articuloId, color_id, orden FROM paleta_color_detalle WHERE paleta_id = :paletaId
5. NO se crean registros en articulo_variante
```

## Flujo de ingreso (futuro)

```
1. Usuario selecciona artículo
2. Sistema lee articulo_talle y articulo_color → muestra grilla
3. Usuario ingresa cantidades por celda
4. Por cada celda con cantidad > 0:
   INSERT INTO articulo_variante ... ON DUPLICATE KEY UPDATE cantidad = cantidad + :nuevaCantidad
```

## Arquitectura de módulos

```
Backend (packages/api/src/modules/)
  clasificacion/
    familia.module, grupo.module, subgrupo.module
  color/
    color.module, paleta-color.module
  talle/
    talle.module, curva-talle.module
  articulo/
    articulo.module          ← orquesta talles/colores al crear
    articulo-variante.module ← stock por variante

Frontend (packages/front/src/app/)
  (sistema)/stock/
    familias/
    grupos/
    subgrupos/
    colores/
    paletas/
    talles/
    curvas/
    articulos/
      page.tsx              ← lista sin cartesiano
      nuevo/page.tsx        ← formulario con curva+paleta
      [id]/page.tsx         ← detalle con grilla talle×color
```

## Risks / Trade-offs

**[Riesgo] Grilla potencial puede ser grande** para artículos con muchos talles y colores.
→ Mitigación: paginar o limitar la grilla. En la práctica indumentaria rara vez supera 10 talles × 10 colores = 100 celdas, manejable.

**[Riesgo] Agregar talle/color al artículo después de crearlo puede ser confuso** si ya hay variantes.
→ Mitigación: UI clara que indica que solo se expande el universo de potenciales; las variantes existentes no cambian.

**[Riesgo] curva_id / paleta_id en artículo pueden quedar NULL** si se elimina la curva/paleta.
→ Mitigación: SET NULL en FK. El artículo sigue funcionando porque su fuente de verdad es `articulo_talle` / `articulo_color`. Se muestra "sin referencia" en la UI.

**[Trade-off] Precio único por artículo** limita modelos donde XL tiene sobrecargo.
→ Decisión consciente para simplificar. Si se necesita en el futuro, agregar `precio_override` en `articulo_variante`.

## Open Questions

- ¿El `codigo_qr` almacena el mismo valor que `codigo_barras` o una URL/JSON con datos del artículo?
- ¿Se requieren permisos granulares por módulo (ARTICULOS_VER, ARTICULOS_CREAR, etc.) o alcanza con un permiso por dominio?
