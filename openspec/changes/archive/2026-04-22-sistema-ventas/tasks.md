## 1. Migración SQL y datos iniciales

- [x] 1.1 Crear migración `6.sql`: tablas `vendedor`, `metodo_pago`, `cuota_metodo_pago`
- [x] 1.2 Crear migración `6.sql`: tablas `venta`, `venta_detalle`, `venta_forma_pago`, `comprobante`
- [x] 1.3 Agregar columnas a `cliente`: `cuit`, `condicion_iva`, `domicilio`, `localidad`, `provincia`, `codigo_postal`
- [x] 1.4 Agregar columna `alicuota_iva` a `articulo` (default `'21'`)
- [x] 1.5 Agregar columna `venta_id` (nullable FK) a `visita`
- [x] 1.6 Agregar tipo `VENTA` al enum de `movimiento_inventario.tipo`
- [x] 1.7 Insertar cliente "Consumidor Final" (CUIT `00000000000`, condicion_iva `CF`)
- [x] 1.8 Insertar claves de config: `ARCA_PUNTO_VENTA`, `ARCA_RAZON_SOCIAL`, `IMPRESION_FORMATO_DEFAULT`
- [x] 1.9 Insertar permisos nuevos en tabla `permissions` (vendedor, metodo-pago, venta, comprobante, arca-config)

## 2. Backend — módulo vendedor

- [x] 2.1 Crear entidad `Vendedor` con campos id, nombre, apellido, dni, codigo, activo
- [x] 2.2 Crear DTOs `CreateVendedorDto` y `UpdateVendedorDto` con validaciones
- [x] 2.3 Crear `VendedorService` con CRUD y filtro por nombre/estado
- [x] 2.4 Crear `VendedorController` con endpoints GET (lista paginada), POST, PUT, DELETE (soft)
- [x] 2.5 Registrar `VendedorModule` en `AppModule`
- [x] 2.6 Agregar permisos de vendedor a `permisos.ts` y `routes.ts`

## 3. Backend — módulo metodo-pago y cuotas

- [x] 3.1 Crear entidades `MetodoPago` y `CuotaMetodoPago`
- [x] 3.2 Crear DTOs para MetodoPago y CuotaMetodoPago con validaciones
- [x] 3.3 Crear `MetodoPagoService`: CRUD de métodos + ABM de cuotas por método
- [x] 3.4 Crear `MetodoPagoController` con endpoints: lista métodos, crear/editar/desactivar método, agregar/editar/desactivar cuota
- [x] 3.5 Registrar `MetodoPagoModule` en `AppModule`
- [x] 3.6 Agregar permisos de metodo-pago a `permisos.ts` y `routes.ts`

## 4. Backend — extensión cliente y artículo

- [x] 4.1 Extender entidad `Cliente` con campos fiscales (CUIT, condicion_iva, domicilio, localidad, provincia, codigo_postal)
- [x] 4.2 Actualizar DTOs de cliente para incluir campos fiscales opcionales
- [x] 4.3 Actualizar `ClienteService.remove` para bloquear eliminación si tiene ventas asociadas
- [x] 4.4 Extender entidad `Articulo` con campo `alicuota_iva`
- [x] 4.5 Actualizar DTOs de artículo para incluir `alicuota_iva`

## 5. Backend — módulo venta

- [x] 5.1 Crear entidades `Venta`, `VentaDetalle`, `VentaFormaPago`
- [x] 5.2 Crear entidad `Comprobante` con campos tipo, tipo_comprobante, punto_venta, numero, fecha_emision, cae, cae_vencimiento, estado, formato_default, datos_arca
- [x] 5.3 Crear DTOs: `CreateVentaDto`, `CreateVentaDetalleDto`, `CreateVentaFormaPagoDto`
- [x] 5.4 Crear `VentaService.crear`: validar visita, cliente, vendedor; guardar en borrador
- [x] 5.5 Crear `VentaService.confirmar`: cambiar estado a confirmada, generar MovimientoInventario tipo VENTA, actualizar visita.venta_id, todo en transacción
- [x] 5.6 Crear `VentaService.emitirManual`: asignar número correlativo con SELECT FOR UPDATE, crear comprobante manual
- [x] 5.7 Crear `VentaService.emitirFiscal`: llamar a afip-api wsfe, manejar éxito (emitido) y error (pendiente_cae)
- [x] 5.8 Crear `VentaService.reintentar`: reintento de emisión fiscal para comprobantes pendiente_cae
- [x] 5.9 Crear `VentaService.anular`: cambiar estado de venta y comprobante a anulado
- [x] 5.10 Crear `VentaController` con endpoints: crear, obtener, confirmar, emitir-manual, emitir-fiscal, reintentar, anular, listado paginado
- [x] 5.11 Registrar `VentaModule` en `AppModule`
- [x] 5.12 Agregar permisos de venta y comprobante a `permisos.ts` y `routes.ts`

## 6. Backend afip-api — módulo wsfe

- [x] 6.1 Crear `WsfeModule` con `WsfeController` y `WsfeService` en `afip-api`
- [x] 6.2 Implementar `WsfeService.solicitarCae`: autenticar con WSAA (usando LoginService existente), llamar a `FECAESolicitar` via soap, parsear respuesta
- [x] 6.3 Implementar `WsfeService.obtenerUltimoComprobante`: llamar a `FECompUltimoAutorizado`
- [x] 6.4 Exponer `@MessagePattern('solicitar-cae')` y `@MessagePattern('obtener-ultimo-comprobante')` en `WsfeController`
- [x] 6.5 Agregar variable de entorno `AFIP_WSFE_URL` al `.env` de `afip-api`
- [x] 6.6 Registrar `WsfeModule` en `AppModule` de `afip-api`

## 7. Frontend — configuración vendedores

- [x] 7.1 Crear servicio `vendedor.ts` con `fetchClient` (getVendedores, createVendedor, updateVendedor, deleteVendedor)
- [x] 7.2 Crear hook `useVendedores` con React Query (lista, create, update, delete)
- [x] 7.3 Crear tabla de vendedores con TanStack Table (columnas: código, nombre, apellido, estado, acciones)
- [x] 7.4 Crear formulario `vendedor-form.tsx` con validación Zod
- [x] 7.5 Crear página `/config/vendedores` con tabla + modal crear/editar
- [x] 7.6 Agregar sección "Vendedores" al menú lateral en config

## 8. Frontend — configuración métodos de pago

- [x] 8.1 Crear servicio `metodo-pago.ts` con fetchClient
- [x] 8.2 Crear hook `useMetodosPago` con React Query
- [x] 8.3 Crear formulario `metodo-pago-form.tsx` (ABM de método + tabla inline de cuotas)
- [x] 8.4 Crear página `/config/metodos-pago` con lista de métodos y edición de cuotas por método
- [x] 8.5 Agregar sección "Métodos de Pago" al menú lateral en config

## 9. Frontend — extensión formulario cliente

- [x] 9.1 Agregar campos fiscales al formulario de cliente (CUIT, condición IVA, domicilio, localidad, provincia, CP)
- [x] 9.2 Implementar auto-completado: al ingresar CUIT válido llamar al endpoint de padrón y pre-completar campos

## 10. Frontend — pantalla de venta

- [x] 10.1 Crear servicio `venta.ts` con fetchClient (crear, obtener, confirmar, emitir-manual, emitir-fiscal, reintentar, anular)
- [x] 10.2 Crear hook `useVenta` con React Query (query por id, mutaciones)
- [x] 10.3 Crear servicio `articulo-venta.ts` para búsqueda de variantes con precio por lista
- [x] 10.4 Crear componente `VentaCabecera`: selector de cliente (pre-cargado desde visita), vendedor, lista de precio, tipo de comprobante con sugerencia automática
- [x] 10.5 Crear componente `VentaDetalleTabla`: tabla de líneas con columnas artículo, talle, color, cantidad, precio, descuento (% o $), subtotal, eliminar
- [x] 10.6 Crear componente `VentaAgregarArticulo`: buscador de artículo + selector de variante + cantidad + confirmar agregar
- [x] 10.7 Crear componente `VentaTotalizador`: cálculo en tiempo real de subtotal, descuento global (% o $), recargo global (% o $), base imponible, IVA 21%, total
- [x] 10.8 Crear componente `VentaFormasPago`: selector de método + cuotas con tasa, monto, saldo restante, lista de pagos agregados con eliminación
- [x] 10.9 Crear componente `VentaAcciones`: botones "Guardar borrador", "Emitir Manual", "Emitir Fiscal ARCA" con lógica de habilitación
- [x] 10.10 Crear página `/ventas/[id]` ensamblando todos los componentes con layout de dos columnas (detalle | totalizador+pagos)
- [x] 10.11 Crear página `/ventas` con listado de ventas (tabla paginada con filtros por fecha, estado, cliente)
- [x] 10.12 Agregar botón "Registrar venta" en la pantalla de resolución de visita (estado COMPRA) que navega a `/ventas/nueva` con visita_id
- [x] 10.13 Agregar sección "Ventas" al menú lateral

## 11. Frontend — impresión de comprobantes

- [x] 11.1 Crear componente `ComprobanteA4` con layout A4 y estilos `@media print`
- [x] 11.2 Crear componente `ComprobanteTermica` con layout 80mm y estilos `@media print`
- [x] 11.3 Crear página `/ventas/[id]/comprobante` que renderiza el comprobante según formato seleccionado con botón imprimir
- [x] 11.4 Leer `IMPRESION_FORMATO_DEFAULT` de config y pre-seleccionar el formato en el selector

## 12. Frontend — permisos

- [x] 12.1 Actualizar `permisos.ts` del frontend con los nuevos permisos de vendedor, metodo-pago, venta y comprobante
- [x] 12.2 Proteger rutas y botones de acción según permisos RBAC
