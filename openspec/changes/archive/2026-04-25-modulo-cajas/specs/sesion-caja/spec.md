## ADDED Requirements

### Requirement: Apertura de sesión de caja
El sistema SHALL permitir abrir una sesión de caja registrando el usuario responsable, la fecha/hora de apertura y el saldo inicial confirmado. Solo SHALL ser posible abrir una sesión si no hay otra sesión con estado 'abierta'. El sistema MUST pre-completar el campo de saldo inicial con el monto de efectivo declarado en el cierre de la sesión anterior (arrastre).

#### Scenario: Apertura exitosa con arrastre de saldo
- **WHEN** el operador accede a la pantalla de apertura y confirma con el saldo inicial
- **THEN** se crea una `sesion_caja` con estado 'abierta', el `usuario_id` del operador logueado, `saldo_inicial_sugerido` igual al efectivo del cierre anterior y `saldo_inicial_confirmado` igual al valor ingresado

#### Scenario: Apertura sin sesión anterior
- **WHEN** no existe ninguna sesión de caja previa en el sistema
- **THEN** el campo de saldo inicial aparece en $0,00 y el operador puede ingresar el monto manualmente

#### Scenario: Intento de apertura con sesión ya abierta
- **WHEN** el operador intenta abrir una sesión y ya existe una con estado 'abierta'
- **THEN** el sistema rechaza la operación con un mensaje indicando que ya hay una sesión activa

---

### Requirement: Cierre de sesión de caja
El sistema SHALL permitir cerrar la sesión activa únicamente si se completó un arqueo de cierre en esa sesión. Al cerrar, MUST registrar la fecha/hora de cierre y cambiar el estado a 'cerrada'.

#### Scenario: Cierre exitoso tras arqueo
- **WHEN** existe un arqueo de tipo 'cierre' en la sesión activa y el operador confirma el cierre
- **THEN** la `sesion_caja` actualiza su estado a 'cerrada' y registra la `fecha_cierre`

#### Scenario: Intento de cierre sin arqueo
- **WHEN** el operador intenta cerrar la sesión sin haber realizado un arqueo de cierre
- **THEN** el sistema rechaza la operación e indica que se debe completar el arqueo primero

---

### Requirement: Consulta de sesión activa
El sistema SHALL exponer un endpoint que devuelva la sesión de caja actualmente abierta, incluyendo el usuario responsable, la fecha de apertura, el saldo inicial y el resumen de movimientos del turno.

#### Scenario: Hay sesión abierta
- **WHEN** se consulta la sesión activa
- **THEN** se devuelve la `sesion_caja` con estado 'abierta' junto con totales de ingresos y egresos del turno

#### Scenario: No hay sesión abierta
- **WHEN** se consulta la sesión activa y no existe ninguna con estado 'abierta'
- **THEN** se devuelve `null` o respuesta vacía indicando que la caja está cerrada

---

### Requirement: Historial de sesiones
El sistema SHALL proveer un listado paginado de sesiones pasadas con fecha, usuario, saldo inicial, saldo declarado al cierre y resultado del arqueo (diferencia total).

#### Scenario: Listado de sesiones
- **WHEN** el administrador accede al historial de cajas
- **THEN** ve un listado paginado ordenado por fecha descendente con el resumen de cada sesión

#### Scenario: Detalle de sesión histórica
- **WHEN** el administrador selecciona una sesión del historial
- **THEN** ve todos los movimientos, los arqueos realizados y el detalle por medio de pago
