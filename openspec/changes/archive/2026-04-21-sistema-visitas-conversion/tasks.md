## 1. Migración SQL

- [x] 1.1 Crear migración: tabla `caracteristica_visitante` (id, nombre, icono, orden, activo)
- [x] 1.2 Crear migración: tabla `razon_no_compra` (id, nombre, orden, activo)
- [x] 1.3 Crear migración: tabla `sub_razon_no_compra` (id, razon_id, nombre, orden, activo)
- [x] 1.4 Crear migración: tabla `visita` (id, fecha, hora, tipo_visitante enum, estado enum, movimiento_id nullable, razon_id nullable, sub_razon_id nullable, articulo_id nullable, cliente_id nullable, observaciones nullable, usuario_id)
- [x] 1.5 Crear migración: tabla `visita_caracteristica` (visita_id, caracteristica_id)
- [x] 1.6 Crear migración: agregar columna `visita_id` nullable a `movimiento_inventario`
- [x] 1.7 Crear migración seed: insertar razones iniciales (Falta de stock, Precio, Forma de pago, Solo miró) con sus sub-razones

## 2. Backend — Módulo caracteristica-visitante

- [x] 2.1 Crear entidad `CaracteristicaVisitante`
- [x] 2.2 Crear DTOs: `CreateCaracteristicaVisitanteDto`, `UpdateCaracteristicaVisitanteDto`
- [x] 2.3 Crear servicio con CRUD + reordenamiento (buildWhereAndOrderQuery)
- [x] 2.4 Crear controlador con endpoints GET (paginado), POST, PATCH/:id, DELETE/:id
- [x] 2.5 Registrar módulo en AppModule

## 3. Backend — Módulo razon-no-compra

- [x] 3.1 Crear entidad `RazonNoCompra` con relación OneToMany a `SubRazonNoCompra`
- [x] 3.2 Crear entidad `SubRazonNoCompra` con relación ManyToOne a `RazonNoCompra`
- [x] 3.3 Crear DTOs para razón y sub-razón (crear, actualizar)
- [x] 3.4 Crear servicio: CRUD razones + CRUD sub-razones anidadas, validar mínimo 1 razón activa
- [x] 3.5 Crear controlador: GET razones con sub-razones, POST razón, PATCH/:id razón, POST/:id/sub-razones, PATCH sub-razón/:id
- [x] 3.6 Registrar módulo en AppModule

## 4. Backend — Módulo visita

- [x] 4.1 Crear entidad `Visita` con relaciones a `CaracteristicaVisitante` (M:N), `RazonNoCompra`, `SubRazonNoCompra`, `Articulo`, `Cliente`, `Usuario`, `MovimientoInventario`
- [x] 4.2 Crear entidad `VisitaCaracteristica` (junction)
- [x] 4.3 Crear DTOs: `CreateVisitaDto`, `ResolverCompraDto`, `ResolverNoCompraDto`
- [x] 4.4 Crear servicio: crear visita (PENDIENTE), resolver como COMPRA, resolver como NO_COMPRA, listar pendientes del día, métricas del día
- [x] 4.5 Crear controlador: POST /visitas, PATCH /visitas/:id/compra, PATCH /visitas/:id/no-compra, GET /visitas/pendientes, GET /visitas/metricas-dia
- [x] 4.6 Agregar endpoint de dashboard: GET /visitas/dashboard con query params período (hoy/semana/mes) — métricas + razones + tabla cruzada por tipo
- [x] 4.7 Registrar módulo en AppModule

## 5. Backend — Modificar movimiento-inventario

- [x] 5.1 Agregar campo `visita_id` nullable a entidad `MovimientoInventario`
- [x] 5.2 Agregar `visita_id` opcional al DTO de creación de movimiento
- [x] 5.3 Verificar que los endpoints existentes no se rompen con el campo nullable

## 6. Frontend — Servicios y hooks

- [x] 6.1 Crear servicio `caracteristica-visitante.service.ts` con fetchClient
- [x] 6.2 Crear hooks `useGetCaracteristicasVisitanteQuery`, `useCreateCaracteristicaVisitanteMutation`, `useUpdateCaracteristicaVisitanteMutation`
- [x] 6.3 Crear servicio `razon-no-compra.service.ts`
- [x] 6.4 Crear hooks `useGetRazonesNoCompraQuery`, `useCreateRazonNoCompraMutation`, `useUpdateRazonNoCompraMutation`, `useCreateSubRazonMutation`, `useUpdateSubRazonMutation`
- [x] 6.5 Crear servicio `visita.service.ts` (crear, resolver compra, resolver no-compra, pendientes, métricas, dashboard)
- [x] 6.6 Crear hooks `useCreateVisitaMutation`, `useResolverCompraMutation`, `useResolverNoCompraMutation`, `useGetVisitasPendientesQuery`, `useGetMetricasDiaQuery`, `useGetDashboardConversionQuery`

## 7. Frontend — Página de registro de visitas (/registro-visitas)

- [x] 7.1 Crear componente `SelectorTipoVisitante` con avatares estáticos por enum (MUJER, HOMBRE, ADULTO_MAYOR, JOVEN, PAREJA, FAMILIA, GRUPO)
- [x] 7.2 Crear componente `SelectorCaracteristicas` con multi-selección de características activas
- [x] 7.3 Crear componente `DialogNuevaVisita` (tipo obligatorio + características opcionales + confirmar)
- [x] 7.4 Crear componente `ModalNoCompra` (selector razón → sub-razón filtrada, artículo opcional, cliente opcional, observaciones)
- [x] 7.5 Crear componente `ListaPendientes` con filas de visitas PENDIENTE + botones [Compró] [No compró]
- [x] 7.6 Crear componente `StatsDelDia` (entradas, compras, no-compras, conversión %, pendientes) con polling/invalidación en tiempo real
- [x] 7.7 Crear página `/registro-visitas` ensamblando los componentes anteriores
- [x] 7.8 Agregar ruta y entrada al menú lateral

## 8. Frontend — Dashboard de conversión (/dashboard/conversion)

- [x] 8.1 Crear componente `TogglePeriodo` (Hoy / Semana / Mes)
- [x] 8.2 Crear componente `CardsMetricas` (entradas, compras, conversión %)
- [x] 8.3 Crear componente `TablaRazonesNoCompra` con filas expandibles para sub-razones
- [x] 8.4 Crear componente `TablaCruzadaTipoVisitante` (tipo × entradas × compras × conversión × razón principal)
- [x] 8.5 Crear página `/dashboard/conversion` ensamblando componentes con invalidación automática para período "Hoy"
- [x] 8.6 Agregar ruta y entrada al menú lateral

## 9. Frontend — Configuración de características (/configuracion/caracteristicas-visitante)

- [x] 9.1 Crear página listado con tabla de características (nombre, ícono, orden, activo)
- [x] 9.2 Crear formulario crear/editar con selector de ícono del set predefinido
- [x] 9.3 Implementar drag-and-drop o botones de reordenamiento
- [x] 9.4 Agregar ruta y entrada al menú de configuración

## 10. Frontend — Configuración de razones (/configuracion/razones-no-compra)

- [x] 10.1 Crear página listado de razones con sub-razones expandibles inline
- [x] 10.2 Crear formulario crear/editar razón
- [x] 10.3 Crear formulario crear/editar sub-razón (anidado bajo su razón)
- [x] 10.4 Implementar reordenamiento de razones y sub-razones
- [x] 10.5 Agregar ruta y entrada al menú de configuración
