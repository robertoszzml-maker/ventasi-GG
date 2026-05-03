## Why

El sistema no cuenta con gestión de stock de artículos. Se necesita un módulo que permita administrar artículos con variantes por talle × color, incluyendo la jerarquía de clasificación (familia/grupo/subgrupo), maestros de colores/talles/paletas/curvas, y control de stock por variante con creación lazy en el momento del ingreso de mercadería.

## What Changes

- **Nuevo**: Jerarquía de clasificación de artículos (familia → grupo → subgrupo)
- **Nuevo**: Maestro de colores con soporte para tramas (hex opcional)
- **Nuevo**: Paletas de colores (agrupación de colores reutilizable)
- **Nuevo**: Maestro de talles con ordenamiento configurable
- **Nuevo**: Curvas de talles (agrupación de talles reutilizable)
- **Nuevo**: Artículos con SKU, código de barras, código QR, precio y clasificación jerárquica
- **Nuevo**: Al crear un artículo se copian los talles de la curva y los colores de la paleta al artículo (fuente de verdad independiente)
- **Nuevo**: Variantes (talle × color) creadas de forma lazy al primer ingreso de mercadería, no al crear el artículo
- **Nuevo**: Grilla talle × color que discrimina variantes "reales" (con ingreso) vs "potenciales" (combinaciones definidas aún sin ingreso)
- **Nuevo**: Stock total del artículo calculado como suma de cantidades de variantes reales

## Capabilities

### New Capabilities

- `clasificacion-articulos`: Jerarquía familia → grupo → subgrupo para clasificar artículos
- `colores-paletas`: Gestión de colores (con soporte trama) y paletas de colores
- `talles-curvas`: Gestión de talles y curvas de talles como plantillas reutilizables
- `articulos`: CRUD de artículos con código, SKU, barcode, QR, precio y clasificación
- `variantes-articulo`: Gestión de variantes talle × color con grilla potencial/real y stock por variante
- `stock-articulo`: Control de stock por variante, creación lazy en ingreso, total calculado

### Modified Capabilities

## Impact

- **Backend**: Nuevos módulos NestJS en `packages/api/src/modules/` para cada dominio
- **Base de datos**: Nuevas tablas: `familia`, `grupo`, `subgrupo`, `color`, `paleta_color`, `paleta_color_detalle`, `talle`, `curva_talle`, `curva_talle_detalle`, `articulo`, `articulo_talle`, `articulo_color`, `articulo_variante`
- **Frontend**: Nuevas páginas CRUD en `packages/front/src/app/` para maestros y artículos
- **Permisos**: Nuevos permisos RBAC para cada módulo
