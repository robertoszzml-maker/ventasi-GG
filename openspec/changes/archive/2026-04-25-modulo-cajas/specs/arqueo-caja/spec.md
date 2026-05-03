## ADDED Requirements

### Requirement: Creación de arqueo
El sistema SHALL permitir crear un arqueo sobre la sesión activa. El arqueo MUST calcular automáticamente el `monto_sistema` por medio de pago sumando los movimientos de la sesión. El operador MUST ingresar el `monto_declarado` por cada medio de pago. El sistema MUST calcular la diferencia (`monto_declarado - monto_sistema`) por medio y la diferencia total.

#### Scenario: Arqueo con valores exactos
- **WHEN** el operador ingresa montos declarados iguales a los calculados por el sistema
- **THEN** el arqueo se guarda con diferencia $0,00 en todos los medios

#### Scenario: Arqueo con diferencia en efectivo
- **WHEN** el sistema calcula $5.200 en efectivo pero el operador declara $5.100
- **THEN** el arqueo registra una diferencia de -$100 en el detalle de efectivo y la diferencia total refleja ese valor

#### Scenario: Arqueo parcial no cierra la sesión
- **WHEN** el operador crea un arqueo de tipo 'parcial'
- **THEN** la sesión permanece con estado 'abierta' y se puede continuar operando

---

### Requirement: Arqueo de cierre obligatorio
El sistema SHALL requerir un arqueo de tipo 'cierre' para poder cerrar la sesión. El arqueo de cierre MUST incluir declaración de montos para todos los medios de pago que tengan movimientos en la sesión.

#### Scenario: Arqueo de cierre habilita el botón de cerrar caja
- **WHEN** se completa un arqueo de tipo 'cierre' en la sesión activa
- **THEN** el botón de "Cerrar Caja" queda habilitado en la pantalla de sesión

#### Scenario: Solo un arqueo de cierre por sesión
- **WHEN** ya existe un arqueo de tipo 'cierre' en la sesión y se intenta crear otro
- **THEN** el sistema rechaza la operación indicando que ya se realizó el arqueo de cierre

---

### Requirement: Consulta de arqueos de una sesión
El sistema SHALL proveer un endpoint que devuelva todos los arqueos de una sesión con su detalle por medio de pago.

#### Scenario: Listado de arqueos
- **WHEN** se consultan los arqueos de una sesión
- **THEN** se devuelve la lista con tipo, fecha, diferencia total y el detalle por medio de pago de cada arqueo
