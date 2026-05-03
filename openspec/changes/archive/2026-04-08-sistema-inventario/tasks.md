## 1. Migración SQL

- [x] 1.1 Crear migración SQL con tablas `ubicacion`, `proveedor`, `cliente`
- [x] 1.2 Crear tabla `movimiento_inventario` con cabecera y 6 FKs nulleables (procedencia/destino)
- [x] 1.3 Crear tabla `movimiento_inventario_detalle` con campos cantidad, cantidad_anterior, cantidad_nueva
- [x] 1.4 Crear tabla `stock_por_ubicacion` con índice compuesto (articulo_variante_id, ubicacion_id)
- [x] 1.5 Insertar permisos RBAC para ubicacion, proveedor, cliente y movimiento-inventario

## 2. Módulo Ubicación (backend)

- [x] 2.1 Crear entidad `Ubicacion` con nombre y descripcion
- [x] 2.2 Crear DTOs create/update/query para ubicacion
- [x] 2.3 Crear servicio con CRUD + validación de eliminación (bloquear si tiene movimientos o stock)
- [x] 2.4 Crear controller con endpoints GET/POST/PATCH/DELETE

## 3. Módulo Proveedor (backend)

- [x] 3.1 Crear entidad `Proveedor` con nombre, cuit, telefono, email
- [x] 3.2 Crear DTOs create/update/query para proveedor
- [x] 3.3 Crear servicio con CRUD + validación de eliminación (bloquear si tiene movimientos)
- [x] 3.4 Crear controller con endpoints GET/POST/PATCH/DELETE

## 4. Módulo Cliente (backend)

- [x] 4.1 Crear entidad `Cliente` con nombre, email, telefono
- [x] 4.2 Crear DTOs create/update/query para cliente
- [x] 4.3 Crear servicio con CRUD + validación de eliminación (bloquear si tiene movimientos)
- [x] 4.4 Crear controller con endpoints GET/POST/PATCH/DELETE

## 5. Módulo Stock por Ubicación (backend)

- [x] 5.1 Crear entidad `StockPorUbicacion` (articulo_variante_id, ubicacion_id, cantidad)
- [x] 5.2 Crear servicio con método de consulta de stock por artículo y ubicación
- [x] 5.3 Crear controller con endpoint de consulta (GET)

## 6. Módulo Movimiento Inventario (backend)

- [x] 6.1 Crear entidades `MovimientoInventario` y `MovimientoInventarioDetalle`
- [x] 6.2 Crear DTOs de creación con validación de procedencia/destino (exactamente 1 seteado)
- [x] 6.3 Crear DTOs de query/filtro (tipo, fecha_desde, fecha_hasta, ubicacion)
- [x] 6.4 Implementar lógica de registro de INGRESO: persistir + incrementar stock_por_ubicacion
- [x] 6.5 Implementar lógica de EGRESO: validar stock disponible + decrementar
- [x] 6.6 Implementar lógica de TRANSFERENCIA: restar origen + sumar destino en transacción
- [x] 6.7 Implementar lógica de ARREGLO: guardar cantidad_anterior, actualizar a cantidad_nueva
- [x] 6.8 Implementar creación automática de articulo_variante si la combinación no existe
- [x] 6.9 Calcular y persistir cantidad_total en cabecera
- [x] 6.10 Crear controller con endpoints GET (listado + detalle) y POST (sin DELETE ni PUT)

## 7. ABM Ubicaciones (frontend)

- [x] 7.1 Crear servicio API para ubicaciones
- [x] 7.2 Crear hooks React Query (lista, detalle, crear, editar, eliminar)
- [x] 7.3 Crear página de listado con tabla paginada y buscador
- [x] 7.4 Crear página de creación con formulario
- [x] 7.5 Crear página de edición con formulario
- [x] 7.6 Agregar sección de Ubicaciones al menú lateral

## 8. ABM Proveedores (frontend)

- [x] 8.1 Crear servicio API para proveedores
- [x] 8.2 Crear hooks React Query (lista, detalle, crear, editar, eliminar)
- [x] 8.3 Crear página de listado con tabla paginada y buscador
- [x] 8.4 Crear página de creación con formulario
- [x] 8.5 Crear página de edición con formulario
- [x] 8.6 Agregar sección de Proveedores al menú lateral

## 9. ABM Clientes (frontend)

- [x] 9.1 Crear servicio API para clientes
- [x] 9.2 Crear hooks React Query (lista, detalle, crear, editar, eliminar)
- [x] 9.3 Crear página de listado con tabla paginada y buscador
- [x] 9.4 Crear página de creación con formulario
- [x] 9.5 Crear página de edición con formulario
- [x] 9.6 Agregar sección de Clientes al menú lateral

## 10. Pantalla de Movimientos (frontend)

- [x] 10.1 Crear servicio API para movimientos (POST crear, GET listado, GET detalle)
- [x] 10.2 Crear hooks React Query para movimientos
- [x] 10.3 Crear componente `GrillaVariantes`: tabla talle×color con inputs de cantidad
- [x] 10.4 Agregar funcionalidad `[+ Nueva combinación]` en GrillaVariantes (selector talle+color)
- [x] 10.5 Crear componente `ArticuloMovimientoRow`: fila expandible con selector de artículo y GrillaVariantes
- [x] 10.6 Crear formulario de cabecera: tipo, procedencia (radio + selector), destino (radio + selector), fecha, responsable, descripción
- [x] 10.7 Crear página de nuevo movimiento: cabecera + lista de N artículos + total calculado + botón registrar
- [x] 10.8 Crear página de listado de movimientos con filtros (tipo, fecha, ubicación)
- [x] 10.9 Crear página de detalle de movimiento (solo lectura)
- [x] 10.10 Agregar sección de Movimientos/Inventario al menú lateral
