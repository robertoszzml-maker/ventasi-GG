## 1. Migración de base de datos

- [x] 1.1 Crear migración SQL: DROP de `venta_forma_pago`, `cuota_metodo_pago`, `metodo_pago`
- [x] 1.2 Crear migración SQL: CREATE TABLE `medio_pago` con todos sus campos (codigo UNIQUE, tipo, cuotas, marca_tarjeta, procesador, orden, activo, arancel, plazo_dias)
- [x] 1.3 Crear migración SQL: CREATE TABLE `cobro` con todos sus campos (venta_id, medio_pago_id, tipo, cuotas, marca_tarjeta, procesador, monto, codigo_autorizacion, ultimos_4, timestamp, estado)
- [x] 1.4 Crear migración SQL: ALTER TABLE `venta` — agregar columnas usuario_id (FK NOT NULL), vuelto (DEFAULT '0.0000'), terminal_id (INT NULL), sesion_caja_id (INT NULL)
- [x] 1.5 Crear migración SQL: SEED de los 15 medios de pago iniciales (EF, V1, V3, V6, V12, VD, M1, M3, M6, MD, A1, N3, MPQ, MPP, TR)

## 2. Limpieza del modelo existente

- [x] 2.1 Eliminar entidad `MetodoPago` y `CuotaMetodoPago`
- [x] 2.2 Eliminar entidad `VentaFormaPago` y su relación en `Venta`
- [x] 2.3 Eliminar módulo NestJS `metodo-pago` (controller, service, module, DTOs)
- [x] 2.4 Actualizar entidad `Venta`: quitar `formasPago: VentaFormaPago[]`, agregar `usuarioId`, `vuelto`, `terminalId`, `sesionCajaId`, relación `cobros: Cobro[]`

## 3. Módulo medio-pago (backend)

- [x] 3.1 Crear entidad `MedioPago` con enums `TipoCobro`, `MarcaTarjeta`, `Procesador`
- [x] 3.2 Crear DTO `CreateMedioPagoDto` y `UpdateMedioPagoDto` con validaciones
- [x] 3.3 Crear `MedioPagoService`: CRUD + método `buscarPorCodigo(codigo)` que retorna 404 si inactivo
- [x] 3.4 Crear `MedioPagoController`: endpoints GET listado activos, GET por código, POST, PATCH, DELETE (soft)
- [x] 3.5 Registrar módulo en `AppModule`

## 4. Módulo cobro (backend)

- [x] 4.1 Crear entidad `Cobro` con enums `EstadoCobro` y relaciones a `Venta` y `MedioPago`
- [x] 4.2 Crear DTO `CreateCobroDto` con validación: `codigo_autorizacion` obligatorio si tipo es CREDITO o DEBITO
- [x] 4.3 Crear `CobroService.crear()`: copia redundancia histórica desde `MedioPago`, asigna timestamp con `getTodayDateTime()`, estado PENDIENTE
- [x] 4.4 Crear `CobroService.listarPorVenta(ventaId)` con suma de montos
- [x] 4.5 Crear `CobroController`: POST crear cobro, GET cobros por venta
- [x] 4.6 Registrar módulo en `AppModule`

## 5. Actualización de VentaService (backend)

- [x] 5.1 Actualizar `VentaService.crear()` para requerir `usuario_id` en el DTO
- [x] 5.2 Actualizar `VentaService.cerrar()`: validar que suma de cobros = total antes de cambiar estado a CONFIRMADA; lanzar error si no coincide

## 6. Frontend — servicio y hooks

- [x] 6.1 Crear `medio-pago.service.ts`: `getMediosPago()`, `getMedioPagoPorCodigo(codigo)`
- [x] 6.2 Crear `cobro.service.ts`: `getCobros(ventaId)`, `createCobro(data)`
- [x] 6.3 Crear hook `useMediosPago()` con React Query
- [x] 6.4 Crear hook `useCobrosPorVenta(ventaId)` con React Query
- [x] 6.5 Crear hook `useCrearCobro()` con mutación e invalidación de cobros

## 7. Frontend — componente panel de cobros

- [x] 7.1 Crear componente `GrillaMediosPago`: botones ordenados por `orden`, click carga el medio
- [x] 7.2 Crear componente `SelectorMedioCodigo`: input de código, Enter busca y autocompleta, error inline si no existe
- [x] 7.3 Crear componente `FormCobro`: campos monto (con max = restante para no-efectivo), codigo_autorizacion (visible solo para CREDITO/DEBITO), ultimos_4, vuelto (visible solo para EFECTIVO)
- [x] 7.4 Crear componente `ListaCobros`: lista de cobros registrados con total parcial y monto restante
- [x] 7.5 Crear componente `PanelCobros` que integra GrillaMediosPago + SelectorMedioCodigo + FormCobro + ListaCobros
- [x] 7.6 Integrar `PanelCobros` en la pantalla `/ventas/nueva` reemplazando el panel de métodos de pago anterior
- [x] 7.7 Conectar el estado "saldo cubierto" al botón COBRAR: deshabilitado si suma cobros < total
