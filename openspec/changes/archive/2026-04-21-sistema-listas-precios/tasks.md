## 1. Migración SQL (4.sql)

- [x] 1.1 Crear tabla `lista_precio` con campos: id, nombre, descripcion, es_default, activo, auditoría
- [x] 1.2 Crear tabla `articulo_precio` con campos: id, articulo_id, lista_precio_id, precio, auditoría, UNIQUE(articulo_id, lista_precio_id)
- [x] 1.3 Insertar seed de lista "Precio General" con `es_default = 1`
- [x] 1.4 Migrar `articulo.precio` → `INSERT INTO articulo_precio` para todos los artículos
- [x] 1.5 `ALTER TABLE articulo DROP COLUMN precio`
- [x] 1.6 `ALTER TABLE articulo ADD COLUMN costo DECIMAL(15,4) NOT NULL DEFAULT '0.0000'`
- [x] 1.7 Insertar permisos: `ARTICULO_VER_COSTO`, `ARTICULO_EDITAR_COSTO`, `LISTA_PRECIO_VER`, `LISTA_PRECIO_CREAR`, `LISTA_PRECIO_EDITAR`, `LISTA_PRECIO_ELIMINAR`

## 2. Módulo backend: lista-precio

- [x] 2.1 Crear entidad `ListaPrecio` (entity + módulo + servicio + controlador)
- [x] 2.2 Endpoint `GET /lista-precio` con filtro por activo
- [x] 2.3 Endpoint `GET /lista-precio/:id`
- [x] 2.4 Endpoint `POST /lista-precio` con lógica de inicialización (CERO, COPIAR, PORCENTAJE, DESDE_COSTO)
- [x] 2.5 Endpoint `PATCH /lista-precio/:id` con lógica de es_default (desmarcar anterior)
- [x] 2.6 Endpoint `DELETE /lista-precio/:id` con validación: no eliminar si es default
- [x] 2.7 Validación: nombre único entre todas las listas
- [x] 2.8 Validación: modo DESDE_COSTO requiere permiso `ARTICULO_VER_COSTO`
- [x] 2.9 Proteger endpoints con permisos `LISTA_PRECIO_*`

## 3. Módulo backend: articulo-precio

- [x] 3.1 Crear entidad `ArticuloPrecio` (entity + módulo + servicio + controlador)
- [x] 3.2 Endpoint `GET /articulo-precio/por-lista/:id` (todos los artículos con su precio en esa lista)
- [x] 3.3 Endpoint `PATCH /articulo-precio/:id` (edición individual)
- [x] 3.4 Endpoint `PATCH /articulo-precio/lote/bulk` (UPSERT en bulk, transaccional)
- [x] 3.5 Endpoint `PATCH /articulo-precio/aplicar-porcentaje/bulk` (porcentaje a seleccionados)
- [x] 3.6 Validación: precio ≥ 0 en todos los endpoints

## 4. Modificar módulo backend: articulo

- [x] 4.1 Agregar campo `costo` a la entidad `Articulo`
- [x] 4.2 Actualizar DTOs de crear/editar artículo para incluir `costo` (opcional según permiso)
- [x] 4.3 En `ArticuloService`, omitir `costo` del DTO de respuesta si el usuario no tiene `ARTICULO_VER_COSTO`
- [x] 4.4 En `ArticuloService`, rechazar `costo` en el payload si el usuario no tiene `ARTICULO_EDITAR_COSTO`
- [x] 4.5 Al crear artículo, llamar a `ListaPrecioService.inicializarParaArticulo(articuloId)` dentro de la misma transacción
- [x] 4.6 Eliminar referencias al campo `precio` en DTOs, servicios y queries existentes

## 5. Frontend: formulario de artículo

- [x] 5.1 Agregar campo `costo` al formulario de crear/editar artículo
- [x] 5.2 Mostrar campo `costo` solo si el usuario tiene `ARTICULO_VER_COSTO`
- [x] 5.3 Deshabilitar campo `costo` si el usuario no tiene `ARTICULO_EDITAR_COSTO`
- [x] 5.4 Eliminar campo `precio` del formulario y del tipo `Articulo`

## 6. Frontend: pantalla de listas de precios

- [x] 6.1 Crear página `/listas-de-precios` con tabla de listas (nombre, default, activo, acciones)
- [x] 6.2 Crear formulario de nueva lista con selector de modo de inicialización
- [x] 6.3 Mostrar campos condicionales según modo (lista origen para COPIAR/PORCENTAJE, factor para DESDE_COSTO)
- [x] 6.4 Ocultar opción DESDE_COSTO si el usuario no tiene `ARTICULO_VER_COSTO`
- [x] 6.5 Agregar acción "Marcar como default" en tabla de listas

## 7. Frontend: pantalla de edición de precios por lista

- [x] 7.1 Crear página `/listas-de-precios/:id` con tabla de artículos y precio editable por fila
- [x] 7.2 Implementar guardado por lote (acumular cambios → botón "Guardar cambios" → request al endpoint lote)
- [x] 7.3 Implementar selector de artículos + acción "Aplicar porcentaje a seleccionados"
- [x] 7.4 Mostrar precio 0 con indicador visual "Sin precio definido"
- [x] 7.5 Agregar búsqueda/filtro de artículos en la tabla

## 8. Permisos y menú

- [x] 8.1 Agregar ruta `/listas-de-precios` al menú lateral bajo sección "Precios"
- [x] 8.2 Insertar permiso de ruta `RUTA_LISTAS_PRECIOS` en la migración SQL (4.sql)
- [ ] 8.3 Asignar nuevos permisos a los roles existentes según matriz de acceso definida
