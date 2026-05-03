## ADDED Requirements

### Requirement: Una venta tiene N cobros (pagos mixtos)
El sistema SHALL permitir registrar uno o más cobros por venta, cada uno asociado a un medio de pago distinto. La suma de los montos de los cobros MUST igualar el total de la venta para que esta pueda cerrarse. Una venta puede tener cobros con medios diferentes simultáneamente (efectivo + tarjeta, dos tarjetas, tarjeta + QR, etc.).

#### Scenario: Agregar primer cobro
- **WHEN** el operador registra un cobro con medio y monto válidos en una venta activa
- **THEN** el cobro se agrega a la venta y el sistema calcula y muestra el monto restante por cobrar

#### Scenario: Agregar segundo cobro (pago mixto)
- **WHEN** el monto restante es mayor a cero y el operador registra un segundo cobro
- **THEN** el segundo cobro se agrega y el monto restante se recalcula

#### Scenario: Cerrar venta con cobros que cubren el total
- **WHEN** la suma de montos de los cobros iguala el total de la venta
- **THEN** el sistema habilita el cierre de la venta

#### Scenario: Cerrar venta sin cobros rechazado
- **WHEN** se intenta cerrar una venta sin cobros
- **THEN** el sistema retorna error "Venta incompleta"

#### Scenario: Cerrar venta con cobros insuficientes rechazado
- **WHEN** la suma de cobros es menor al total y se intenta cerrar la venta
- **THEN** el sistema retorna error "Monto cobrado no coincide con total"

---

### Requirement: Redundancia histórica en el Cobro
Al registrar un cobro, el sistema SHALL copiar los campos `tipo`, `cuotas`, `marca_tarjeta` y `procesador` desde el medio de pago seleccionado hacia el registro del cobro. Estos valores copiados son inmutables una vez registrado el cobro; si el medio se modifica a futuro, el histórico no cambia.

#### Scenario: Campos copiados al registrar cobro
- **WHEN** se registra un cobro asociado a un medio de pago
- **THEN** tipo, cuotas, marca_tarjeta y procesador del cobro reflejan los valores del medio en ese momento

#### Scenario: Modificar el medio no altera cobros históricos
- **WHEN** se modifica el nombre o procesador de un medio de pago existente
- **THEN** los cobros ya registrados con ese medio conservan los valores originales copiados al momento del cobro

---

### Requirement: Código de autorización obligatorio para cobros con tarjeta
El sistema SHALL requerir el campo `codigo_autorizacion` cuando el tipo del cobro es CREDITO o DEBITO. Para los tipos EFECTIVO, QR y TRANSFERENCIA el campo es opcional.

#### Scenario: Cobro CREDITO sin código de autorización rechazado
- **WHEN** se intenta registrar un cobro de tipo CREDITO sin codigo_autorizacion
- **THEN** el sistema retorna error "Autorización obligatoria para crédito"

#### Scenario: Cobro DEBITO sin código de autorización rechazado
- **WHEN** se intenta registrar un cobro de tipo DEBITO sin codigo_autorizacion
- **THEN** el sistema retorna error "Autorización obligatoria para débito"

#### Scenario: Cobro EFECTIVO sin código de autorización aceptado
- **WHEN** se registra un cobro de tipo EFECTIVO sin codigo_autorizacion
- **THEN** el cobro se guarda correctamente con codigo_autorizacion en NULL

---

### Requirement: Vuelto separado del monto del cobro en efectivo
El sistema SHALL registrar en `venta.vuelto` el monto devuelto al cliente cuando paga en efectivo con más dinero del necesario. El cobro en efectivo SHALL registrar el valor de la venta, no el billete entregado.

#### Scenario: Cobro exacto sin vuelto
- **WHEN** el cliente paga exactamente el monto del cobro en efectivo
- **THEN** el cobro se registra por el monto de la venta y vuelto queda en 0

#### Scenario: Cobro con vuelto en efectivo
- **WHEN** el operador registra el cobro por el monto de la venta y agrega el vuelto por separado
- **THEN** el cobro se registra por el valor de la venta y venta.vuelto refleja el monto devuelto al cliente

#### Scenario: Vuelto solo aplica para efectivo
- **WHEN** el operador intenta ingresar un monto mayor al restante en un cobro que no es EFECTIVO
- **THEN** la UI impide el ingreso

---

### Requirement: Estado del cobro con valor inicial PENDIENTE
El sistema SHALL asignar el estado PENDIENTE a todo cobro al momento de su creación. Los valores posibles son PENDIENTE, ACREDITADO, PARCIAL y CON_DIFERENCIA. La transición de estados la gestionará el módulo de Cobranzas en una entrega futura.

#### Scenario: Estado inicial PENDIENTE
- **WHEN** se crea un cobro
- **THEN** su estado es PENDIENTE independientemente del medio de pago

---

### Requirement: Cobro rechazado por POS no se registra
El sistema SHALL no registrar ningún cobro cuando el POS rechaza la transacción. El operador puede intentar con otro medio sin dejar registros inválidos en la base.

#### Scenario: Intento fallido no genera cobro
- **WHEN** el operador informa que el POS rechazó la tarjeta
- **THEN** no se registra ningún cobro y el monto restante permanece igual

#### Scenario: Reintento con otro medio disponible
- **WHEN** un cobro fue rechazado y el operador selecciona otro medio
- **THEN** puede registrar un nuevo cobro sin restricciones
