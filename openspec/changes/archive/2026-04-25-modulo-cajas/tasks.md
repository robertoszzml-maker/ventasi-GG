## 1. Migración de base de datos

- [x] 1.1 Crear `7.sql` con tablas `caja`, `sesion_caja`, `concepto_movimiento`, `movimiento_caja`, `arqueo_caja`, `arqueo_caja_detalle`
- [x] 1.2 Agregar columnas `tipo_operacion` (VARCHAR DEFAULT 'venta') y `venta_origen_id` (INT NULL FK) a la tabla `venta` en `7.sql`
- [x] 1.3 Agregar seed de conceptos de movimiento predeterminados: Retiro (EGRESO), Caja Chica (EGRESO), Depósito (INGRESO), Ajuste (EGRESO), Otro (EGRESO)

## 2. Backend — Módulo Caja (configuración)

- [x] 2.1 Crear módulo NestJS `caja` con entidad, servicio y controlador (CRUD básico)
- [x] 2.2 Crear módulo NestJS `concepto-movimiento` con entidad, servicio y controlador (ABM + listado activos)

## 3. Backend — Módulo Sesión de Caja

- [x] 3.1 Crear entidad `SesionCaja` con campos: `caja_id`, `usuario_id`, `estado`, `fecha_apertura`, `fecha_cierre`, `saldo_inicial_sugerido`, `saldo_inicial_confirmado`, `sesion_anterior_id`
- [x] 3.2 Implementar endpoint `POST /sesiones-caja/abrir` con validación de sesión única y cálculo de arrastre de saldo
- [x] 3.3 Implementar endpoint `POST /sesiones-caja/cerrar` con validación de arqueo de cierre previo
- [x] 3.4 Implementar endpoint `GET /sesiones-caja/activa` que devuelve la sesión abierta con totales de movimientos
- [x] 3.5 Implementar endpoint `GET /sesiones-caja` paginado para historial
- [x] 3.6 Implementar endpoint `GET /sesiones-caja/:id` con detalle completo de movimientos y arqueos

## 4. Backend — Módulo Movimiento de Caja

- [x] 4.1 Crear entidad `MovimientoCaja` con campos: `sesion_caja_id`, `tipo` (INGRESO/EGRESO), `concepto_movimiento_id`, `medio_pago_id`, `monto`, `descripcion`, `referencia_tipo`, `referencia_id`
- [x] 4.2 Implementar endpoint `POST /movimientos-caja` para movimientos manuales (valida sesión activa)
- [x] 4.3 Implementar endpoint `GET /movimientos-caja?sesion_caja_id=X` para listado de movimientos de una sesión
- [x] 4.4 Implementar subscriber EventEmitter2: escucha `venta.confirmada` y crea N movimientos INGRESO (uno por cobro) cuando `tipo_operacion = 'venta'`
- [x] 4.5 Implementar subscriber EventEmitter2: escucha `venta.confirmada` y crea movimientos EGRESO cuando `tipo_operacion = 'nota_credito'`
- [x] 4.6 Implementar subscriber EventEmitter2: escucha `venta.confirmada` y crea movimientos INGRESO cuando `tipo_operacion = 'nota_debito'`

## 5. Backend — Módulo Arqueo de Caja

- [x] 5.1 Crear entidades `ArqueoCaja` y `ArqueoCajaDetalle`
- [x] 5.2 Implementar endpoint `POST /arqueos-caja` que calcula `monto_sistema` por medio de pago y persiste con `monto_declarado` y diferencia
- [x] 5.3 Implementar validación: solo un arqueo de tipo 'cierre' por sesión
- [x] 5.4 Implementar endpoint `GET /arqueos-caja?sesion_caja_id=X` para listado de arqueos con detalle

## 6. Backend — Extensión del módulo Venta para NC/ND

- [x] 6.1 Agregar campo `tipo_operacion` y `venta_origen_id` a la entidad `Venta`
- [x] 6.2 Actualizar `VentaService.create` para aceptar y persistir `tipo_operacion` y `venta_origen_id`
- [x] 6.3 Agregar guard en `VentaService.create` y `VentaService.confirmar` que valida existencia de sesión de caja activa (warning en log si no hay, no excepción)
- [x] 6.4 Actualizar endpoint `GET /ventas` para soportar filtro por `tipo_operacion`
- [x] 6.5 Emitir evento `venta.confirmada` con el `tipo_operacion` incluido en el payload

## 7. Frontend — Servicios y hooks de Cajas

- [x] 7.1 Crear `src/services/sesion-caja.service.ts` con métodos: `getSesionActiva`, `abrirCaja`, `cerrarCaja`, `getHistorial`, `getSesionDetalle`
- [x] 7.2 Crear `src/services/movimiento-caja.service.ts` con métodos: `getMovimientos`, `crearMovimiento`
- [x] 7.3 Crear `src/services/arqueo-caja.service.ts` con métodos: `getArqueos`, `crearArqueo`
- [x] 7.4 Crear `src/services/concepto-movimiento.service.ts` con métodos: `getConceptosActivos`, `getConceptos`, `crearConcepto`, `actualizarConcepto`
- [x] 7.5 Crear hooks React Query correspondientes para cada servicio

## 8. Frontend — Páginas de Cajas

- [x] 8.1 Crear página `/cajas` con estado actual (sesión abierta/cerrada, resumen del turno o botón de apertura)
- [x] 8.2 Crear página `/cajas/apertura` con formulario de saldo inicial (pre-completado con arrastre) y botón confirmar apertura
- [x] 8.3 Crear página `/cajas/sesion` con dashboard de sesión activa: totales por medio de pago, lista de movimientos y botones de acción (nuevo movimiento, arqueo parcial, cerrar caja)
- [x] 8.4 Crear formulario de movimiento manual (modal o inline) con selector de concepto, medio de pago, monto y descripción
- [x] 8.5 Crear página `/cajas/arqueo/nuevo` con tabla de medios de pago (sistema vs declarado) y campo de diferencia calculada
- [x] 8.6 Crear página `/cajas/cierre` que fuerza arqueo de cierre y confirma el cierre de sesión
- [x] 8.7 Crear página `/cajas/historial` con tabla paginada de sesiones pasadas
- [x] 8.8 Crear página `/cajas/historial/[id]` con detalle completo de la sesión

## 9. Frontend — Administración de Conceptos

- [x] 9.1 Crear página `/config/cajas/conceptos` con tabla de conceptos (ABM) y botón de agregar

## 10. Frontend — Actualización del POS

- [x] 10.1 Agregar guard en `/ventas/nueva`: consultar sesión activa al montar, mostrar bloqueo con enlace a apertura si no hay sesión
- [x] 10.2 Agregar selector de `tipo_operacion` (Venta / NC / ND) en el header del POS
- [x] 10.3 Mostrar campo de búsqueda de venta origen (opcional) cuando `tipo_operacion` es NC o ND
- [x] 10.4 Actualizar el botón de confirmar para mostrar 'Confirmar Venta', 'Emitir NC' o 'Emitir ND' según el tipo seleccionado
- [x] 10.5 Pasar `tipo_operacion` y `venta_origen_id` al payload de creación de venta

## 11. Frontend — Listados NC y ND

- [x] 11.1 Crear página `/ventas/notas-de-credito` con tabla paginada filtrando `tipo_operacion = nota_credito`
- [x] 11.2 Crear página `/ventas/notas-de-debito` con tabla paginada filtrando `tipo_operacion = nota_debito`

## 12. Menú y navegación

- [x] 12.1 Agregar sección "Cajas" al menú lateral con entradas: Estado de Caja, Historial
- [x] 12.2 Agregar entrada "Notas de Crédito" y "Notas de Débito" bajo la sección de Ventas del menú
- [x] 12.3 Agregar entrada "Conceptos de Movimiento" bajo la sección de Configuración del menú
