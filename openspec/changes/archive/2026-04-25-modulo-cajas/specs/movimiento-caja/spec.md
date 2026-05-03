## ADDED Requirements

### Requirement: Movimientos automáticos por venta confirmada
El sistema SHALL crear automáticamente un `movimiento_caja` de tipo INGRESO por cada `cobro` de una venta confirmada, usando el `medio_pago_id` del cobro y el monto correspondiente. El movimiento MUST quedar vinculado a la `sesion_caja` activa en el momento de la confirmación y a la `venta_id` como referencia.

#### Scenario: Venta con cobro único genera un movimiento
- **WHEN** se confirma una venta con un solo cobro de $1.500 en efectivo
- **THEN** se crea un `movimiento_caja` INGRESO de $1.500 con `medio_pago_id` = efectivo vinculado a la sesión activa

#### Scenario: Venta con cobros múltiples genera un movimiento por cobro
- **WHEN** se confirma una venta con dos cobros ($1.000 efectivo + $500 débito)
- **THEN** se crean dos `movimiento_caja` INGRESO: uno de $1.000 con medio efectivo y otro de $500 con medio débito

#### Scenario: No hay sesión activa al confirmar venta
- **WHEN** se confirma una venta y no hay sesión de caja abierta
- **THEN** el sistema registra un warning en log pero no falla la venta; el movimiento queda sin `sesion_caja_id`

---

### Requirement: Movimientos automáticos por NC y ND emitidas
El sistema SHALL crear automáticamente un `movimiento_caja` al emitirse una nota de crédito (EGRESO) o nota de débito (INGRESO), por cada `cobro` del documento, vinculado a la sesión activa.

#### Scenario: NC emitida genera movimiento EGRESO
- **WHEN** se emite una nota de crédito con cobro de $800 en efectivo
- **THEN** se crea un `movimiento_caja` EGRESO de $800 con `medio_pago_id` = efectivo en la sesión activa

#### Scenario: ND emitida genera movimiento INGRESO
- **WHEN** se emite una nota de débito con cobro de $300 en transferencia
- **THEN** se crea un `movimiento_caja` INGRESO de $300 con `medio_pago_id` = transferencia en la sesión activa

---

### Requirement: Registro de movimientos manuales
El sistema SHALL permitir registrar movimientos manuales (egresos o ingresos) durante una sesión activa, seleccionando un `concepto_movimiento` y un monto. El `medio_pago_id` SHALL ser requerido para movimientos de efectivo y opcional para los demás.

#### Scenario: Registro de retiro de efectivo
- **WHEN** el operador registra un movimiento manual con concepto 'Retiro' y monto $2.000
- **THEN** se crea un `movimiento_caja` EGRESO de $2.000 vinculado a la sesión activa con la descripción ingresada

#### Scenario: Sin sesión activa no se puede registrar movimiento manual
- **WHEN** el operador intenta registrar un movimiento manual y no hay sesión abierta
- **THEN** el sistema rechaza la operación con un mensaje indicando que no hay caja abierta

---

### Requirement: Inmutabilidad de movimientos
El sistema SHALL prohibir la eliminación o modificación de movimientos de caja una vez registrados. Solo se permiten lecturas.

#### Scenario: Intento de eliminar movimiento
- **WHEN** se intenta eliminar un `movimiento_caja` existente
- **THEN** el sistema rechaza la operación con error 403 o equivalente
