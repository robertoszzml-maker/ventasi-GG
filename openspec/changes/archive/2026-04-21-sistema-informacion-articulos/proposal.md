## Why

El sistema actual de artículos carece de información comercial y operativa clave: no distingue si un artículo es de temporada o de venta continua, no identifica artículos estratégicos ("ancla"), y no tiene umbrales de stock por variante que permitan alertas tempranas. Esto impide tomar decisiones de reposición informadas y no hay visibilidad centralizada del estado de los productos más críticos.

## What Changes

- **Nuevo campo `tipo_continuidad`** en artículo: enum `continuidad | temporada`, exclusivos entre sí.
- **Nuevo campo `es_ancla`** en artículo: boolean que marca el artículo como estratégico/prioritario.
- **Nuevos campos de umbrales de stock** en artículo-variante: `stock_minimo`, `stock_seguridad`, `stock_maximo` (enteros nullable).
- **Semáforo de stock** calculado en runtime por variante: ROJO (≤ mínimo), AMARILLO (> mínimo y ≤ seguridad), VERDE (> seguridad).
- **Atajos de carga masiva** en UI: aplicar umbrales iguales a todas las variantes de un artículo (atajo A), y copiar umbrales de una variante a las demás (atajo B).
- **Dashboard de artículos ancla**: tabla con filas expandibles, mostrando cada variante con su stock y estado semáforo.

## Capabilities

### New Capabilities

- `clasificacion-articulo`: Campos `tipo_continuidad` y `es_ancla` en artículo — clasificación comercial y estratégica.
- `umbrales-stock-variante`: Campos `stock_minimo`, `stock_seguridad`, `stock_maximo` por variante y lógica de semáforo.
- `carga-masiva-umbrales`: Atajos de UI para asignar umbrales en bloque (todas las variantes) o por copia entre variantes.
- `dashboard-anclas`: Página de dashboard con tabla de artículos ancla, stock por variante y estado semáforo expandible.

### Modified Capabilities

- `stock-por-ubicacion`: El stock total por variante ahora se compara contra umbrales definidos en `articulo_variante` para calcular el estado semáforo.

## Impact

- **Backend**: `articulo.entity.ts`, `articulo_variante.entity.ts`, DTOs, servicios y controladores de ambos módulos. Nuevos endpoints para carga masiva y dashboard.
- **Frontend**: `ArticuloForm` (nuevos campos), tab Inventario (`CombinacionesArticulo` extendido con columnas de umbrales y atajos), nueva página de dashboard.
- **Base de datos**: Migración SQL con ALTER TABLE en `articulo` y `articulo_variante`.
- **Sin breaking changes** en APIs existentes — solo adición de campos opcionales y endpoints nuevos.
