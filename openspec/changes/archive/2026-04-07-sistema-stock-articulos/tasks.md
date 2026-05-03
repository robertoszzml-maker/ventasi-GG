## 1. Migración de base de datos

- [x] 1.1 Crear migración SQL con tablas: familia, grupo, subgrupo
- [x] 1.2 Crear migración SQL con tablas: color, paleta_color, paleta_color_detalle
- [x] 1.3 Crear migración SQL con tablas: talle, curva_talle, curva_talle_detalle
- [x] 1.4 Crear migración SQL con tablas: articulo, articulo_talle, articulo_color
- [x] 1.5 Crear migración SQL con tabla: articulo_variante (UNIQUE articulo_id, talle_id, color_id)
- [x] 1.6 Agregar permisos RBAC para cada módulo en la migración

## 2. Backend — Clasificación (familia / grupo / subgrupo)

- [x] 2.1 Crear módulo NestJS `familia` con entity, service, controller y CRUD completo
- [x] 2.2 Crear módulo NestJS `grupo` con filtro por familia_id
- [x] 2.3 Crear módulo NestJS `subgrupo` con filtro por grupo_id

## 3. Backend — Colores y paletas

- [x] 3.1 Crear módulo NestJS `color` con entity, service, controller y CRUD completo
- [x] 3.2 Crear módulo NestJS `paleta-color` con gestión de colores asociados (paleta_color_detalle)
- [x] 3.3 Endpoint para agregar/quitar colores de una paleta

## 4. Backend — Talles y curvas

- [x] 4.1 Crear módulo NestJS `talle` con entity, service, controller y CRUD completo
- [x] 4.2 Crear módulo NestJS `curva-talle` con gestión de talles asociados (curva_talle_detalle)
- [x] 4.3 Endpoint para agregar/quitar talles de una curva

## 5. Backend — Artículos

- [x] 5.1 Crear módulo NestJS `articulo` con entity, service, controller
- [x] 5.2 Endpoint POST /articulos: crear artículo, copiar talles de curva a articulo_talle, copiar colores de paleta a articulo_color (sin crear variantes)
- [x] 5.3 Endpoint GET /articulos: listado sin cartesiano con stock_total y total_variantes calculados
- [x] 5.4 Endpoint GET /articulos/:id: detalle del artículo con sus talles y colores
- [x] 5.5 Endpoint PUT /articulos/:id: editar datos del artículo (nombre, precio, sku, etc.)
- [x] 5.6 Endpoint POST /articulos/:id/talles: agregar talle al artículo fuera de la curva
- [x] 5.7 Endpoint POST /articulos/:id/colores: agregar color al artículo fuera de la paleta

## 6. Backend — Variantes y stock

- [x] 6.1 Crear módulo NestJS `articulo-variante` con entity, service, controller
- [x] 6.2 Endpoint GET /articulos/:id/grilla: retorna combinaciones talle × color con estado potencial/real/real-extra
- [x] 6.3 Endpoint POST /articulos/:id/ingresos: registrar ingreso, crear variante si no existe, sumar cantidad
- [x] 6.4 Endpoint PUT /articulos/:id/variantes/:varianteId: ajuste manual de cantidad
- [x] 6.5 Endpoint PATCH /articulos/:id/variantes/:varianteId/desactivar: desactivar variante

## 7. Frontend — Maestros de clasificación

- [x] 7.1 Crear servicio y hooks para familia, grupo, subgrupo
- [x] 7.2 Página CRUD familias: lista con tabla TanStack + formulario
- [x] 7.3 Página CRUD grupos: lista filtrable por familia + formulario con selector de familia
- [x] 7.4 Página CRUD subgrupos: lista filtrable por grupo + formulario con selectores familia→grupo

## 8. Frontend — Maestros de colores y paletas

- [x] 8.1 Crear servicio y hooks para color y paleta-color
- [x] 8.2 Página CRUD colores: lista con muestra visual de color/trama + formulario (con campo hex opcional)
- [x] 8.3 Página CRUD paletas: lista + formulario con selector múltiple de colores y ordenamiento

## 9. Frontend — Maestros de talles y curvas

- [x] 9.1 Crear servicio y hooks para talle y curva-talle
- [x] 9.2 Página CRUD talles: lista con campo orden + formulario
- [x] 9.3 Página CRUD curvas: lista + formulario con selector múltiple de talles y ordenamiento

## 10. Frontend — Artículos

- [x] 10.1 Crear servicio y hooks para artículos
- [x] 10.2 Página lista de artículos: tabla con nombre, SKU, precio, subgrupo, variantes reales, stock total
- [x] 10.3 Página crear artículo: formulario con selector de subgrupo (familia→grupo→subgrupo), curva y paleta (obligatorios)
- [x] 10.4 Página editar/detalle artículo: datos del artículo + sección para agregar talles/colores adicionales

## 11. Frontend — Grilla talle × color y stock

- [x] 11.1 Crear servicio y hooks para grilla y variantes
- [x] 11.2 Componente GrillaVariantes: tabla talle × color con discriminación visual potencial (gris) / real (activo) / desactivada
- [x] 11.3 Integrar GrillaVariantes en página de detalle de artículo
- [x] 11.4 Formulario de ingreso de mercadería: muestra grilla editable con cantidades por celda
- [x] 11.5 Acción de ajuste manual de stock por variante desde la grilla

## 12. Frontend — Menú y navegación

- [x] 12.1 Agregar sección "Stock" al menú lateral con subsecciones: Artículos, Maestros (clasificación, colores, talles)
- [x] 12.2 Configurar rutas en Next.js App Router para todas las páginas del módulo
