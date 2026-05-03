## 1. Migración SQL

- [x] 1.1 Crear `packages/api/sql/5.sql` con ALTER TABLE en `articulo` para agregar `tipo_continuidad VARCHAR(20) NULL` y `es_ancla TINYINT(1) NOT NULL DEFAULT 0` con índice en `es_ancla`
- [x] 1.2 Agregar en la misma migración ALTER TABLE en `articulo_variante` para agregar `stock_minimo INT NULL`, `stock_seguridad INT NULL`, `stock_maximo INT NULL`

## 2. Backend — Entidad y DTOs de Artículo

- [x] 2.1 Agregar `tipo_continuidad` y `es_ancla` a `articulo.entity.ts`
- [x] 2.2 Agregar `tipo_continuidad` y `es_ancla` a `create-articulo.dto.ts` con validaciones (`@IsIn`, `@IsBoolean`, `@IsOptional`)
- [x] 2.3 Crear o actualizar `update-articulo.dto.ts` extendiendo `PartialType(CreateArticuloDto)` si no existe

## 3. Backend — Entidad y DTOs de ArticuloVariante

- [x] 3.1 Agregar `stockMinimo`, `stockSeguridad`, `stockMaximo` a `articulo-variante.entity.ts`
- [x] 3.2 Crear `update-umbrales-variante.dto.ts` con los tres campos opcionales y validaciones `@IsInt`, `@Min(0)`, `@IsOptional`

## 4. Backend — Lógica de semáforo

- [x] 4.1 Crear helper `calcularEstadoSemaforo(stock: number, minimo: number | null, seguridad: number | null): 'ROJO' | 'AMARILLO' | 'VERDE' | 'SIN_ESTADO'` en el módulo de articulo-variante
- [x] 4.2 Extender el query SQL en `getGrilla` de `ArticuloVarianteService` para incluir `v.stock_minimo`, `v.stock_seguridad`, `v.stock_maximo` en el SELECT y retornarlos en cada celda con `estadoSemaforo` calculado

## 5. Backend — Endpoints de carga masiva

- [x] 5.1 Agregar endpoint `POST /articulo-variante/bulk-umbrales` en el controlador: recibe `{ articuloId, stockMinimo, stockSeguridad, stockMaximo }` y actualiza todas las variantes activas del artículo en transacción
- [x] 5.2 Agregar endpoint `POST /articulo-variante/:id/copiar-umbrales` en el controlador: copia los umbrales de la variante origen a todas las demás del mismo artículo en transacción
- [x] 5.3 Agregar los DTOs correspondientes para los dos endpoints nuevos

## 6. Backend — Dashboard de anclas

- [x] 6.1 Agregar endpoint `GET /articulos/dashboard-anclas` en `ArticuloController`: devuelve artículos con `es_ancla = true` con sus variantes, stock, umbrales y estado semáforo (incluyendo estado agregado del artículo = peor estado entre sus variantes)
- [x] 6.2 Implementar el método `getDashboardAnclas()` en `ArticuloService` con query optimizada (sin N+1): JOIN articulo → articulo_variante → stock_por_ubicacion, calculando stock por variante y estado semáforo
- [x] 6.3 Agregar permiso para el endpoint de dashboard en `permisos.ts` del backend

## 7. Frontend — Servicio y Hooks

- [x] 7.1 Agregar `actualizarUmbralVariante(id, dto)`, `bulkUmbrales(dto)` y `copiarUmbrales(id)` en `packages/front/src/services/articulo-variante.ts` (o crearlo si no existe)
- [x] 7.2 Agregar `getDashboardAnclas()` en `packages/front/src/services/articulos.ts`
- [x] 7.3 Crear hooks React Query en `packages/front/src/hooks/articulo-variante.tsx`: `useActualizarUmbralVarianteMutation`, `useBulkUmbralesMutation`, `useCopiarUmbralesMutation`
- [x] 7.4 Crear hook `useGetDashboardAnclasQuery` en `packages/front/src/hooks/articulos.tsx`

## 8. Frontend — Formulario de artículo

- [x] 8.1 Agregar campo `tipo_continuidad` al `ArticuloForm` como radio group (`○ Continuidad  ○ Temporada`) con validación Zod
- [x] 8.2 Agregar campo `es_ancla` al `ArticuloForm` como Switch con label "Artículo ancla"
- [x] 8.3 Actualizar el tipo `Articulo` en `packages/front/src/types/index.d.ts` con los nuevos campos

## 9. Frontend — Tab Inventario con umbrales

- [x] 9.1 Extender el componente `CombinacionesArticulo` (o la tabla de variantes del tab Inventario) para mostrar columnas de Mín, Seg, Máx y Estado semáforo por celda
- [x] 9.2 Hacer las columnas de umbrales editables inline (input numérico por celda) con guardado al blur/enter usando `useActualizarUmbralVarianteMutation`
- [x] 9.3 Agregar botón "Aplicar a todas las variantes" (Atajo A) en el header del tab Inventario: abre dialog con inputs de mín/seg/máx y botón de confirmar
- [x] 9.4 Agregar botón "Copiar a todas" por fila/celda (Atajo B): al hacer click copia los umbrales de esa variante a las demás, con confirmación

## 10. Frontend — Dashboard de artículos ancla

- [x] 10.1 Crear página `packages/front/src/app/(admin)/dashboard/page.tsx` con tabla de artículos ancla usando `useGetDashboardAnclasQuery`
- [x] 10.2 Implementar filas expandibles: fila de artículo colapsada muestra nombre, código, stock total y estado agregado; expandida muestra tabla de variantes con talle, color, stock, mín, seg, máx, estado
- [x] 10.3 Implementar indicadores visuales del semáforo: badge o dot de color (rojo/amarillo/verde/gris) consistente en toda la UI
- [x] 10.4 Agregar permiso de dashboard en `packages/front/src/constants/permisos.ts` y validar acceso en la página

## 11. Permisos y menú

- [x] 11.1 Agregar permiso `DASHBOARD_ANCLAS_VER` (o similar) en `packages/api/src/constants/permisos.ts`
- [x] 11.2 Agregar permiso en `packages/front/src/constants/permisos.ts`
- [x] 11.3 Verificar que el ítem "Dashboard" en el menú lateral apunta a `/dashboard` y tiene el permiso correcto asignado
