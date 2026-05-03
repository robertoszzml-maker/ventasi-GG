## MODIFIED Requirements

### Requirement: Guard de sesión de caja activa
El sistema SHALL verificar que existe una sesión de caja con estado 'abierta' antes de permitir crear o confirmar una venta, nota de crédito o nota de débito. Si no hay sesión abierta, el POS MUST mostrar un mensaje de bloqueo con un enlace para ir a abrir la caja.

#### Scenario: POS bloqueado sin sesión activa
- **WHEN** el operador accede a `/ventas/nueva` y no hay sesión de caja abierta
- **THEN** el sistema muestra un aviso de "Caja cerrada" con un botón que redirige a la pantalla de apertura de caja

#### Scenario: POS disponible con sesión activa
- **WHEN** el operador accede a `/ventas/nueva` y existe una sesión de caja abierta
- **THEN** el POS carga normalmente y permite operar
