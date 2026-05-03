## REMOVED Requirements

### Requirement: Pago rápido por pills de método
**Reason**: Reemplazado por el flujo de cobros con código rápido, grilla de botones y panel de monto restante. El modelo de `medio_pago` con código rápido hace obsoleto el concepto de "pill" genérico.
**Migration**: Ver requirements ADDED a continuación.

## ADDED Requirements

### Requirement: Selector de medio de pago por código rápido
El sistema SHALL permitir al operador seleccionar un medio de pago tecleando su código (2-4 caracteres) y presionando Enter. Al ingresar un código válido, el sistema SHALL autocompletar nombre, tipo, cuotas, marca y procesador del cobro.

#### Scenario: Código válido autocompleta el medio
- **WHEN** el operador teclea un código existente y activo (ej. "V3") y presiona Enter
- **THEN** el sistema carga el medio correspondiente (Visa crédito 3 cuotas, CLOVER) y posiciona el cursor en el campo de monto

#### Scenario: Código inválido muestra error inline
- **WHEN** el operador teclea un código que no existe o está inactivo y presiona Enter
- **THEN** el sistema muestra error inline "Medio no encontrado" sin interrumpir el flujo

---

### Requirement: Grilla de botones rápidos de medios de pago
El sistema SHALL mostrar los medios de pago activos como botones grandes ordenados por el campo `orden`. Un click en un botón SHALL cargar ese medio directamente, equivalente a teclear su código.

#### Scenario: Click en botón carga el medio
- **WHEN** el operador hace click en un botón de la grilla (ej. "V3 — Visa 3 cuotas")
- **THEN** el medio queda seleccionado y el cursor se posiciona en el campo de monto

#### Scenario: Solo medios activos en la grilla
- **WHEN** se renderiza la grilla de botones
- **THEN** solo aparecen medios con `activo = 1`, ordenados por `orden`

---

### Requirement: Panel de cobros con monto restante
El sistema SHALL mostrar en tiempo real el monto restante por cobrar (total de la venta menos la suma de cobros ya registrados). El botón de cierre de venta SHALL estar deshabilitado mientras el monto restante sea mayor a cero.

#### Scenario: Monto restante se actualiza al agregar cobro
- **WHEN** el operador agrega un cobro
- **THEN** la pantalla muestra "Resta cobrar: $XX.XXX" con el nuevo saldo calculado

#### Scenario: Botón cerrar habilitado al cubrir total
- **WHEN** la suma de cobros iguala el total de la venta
- **THEN** el botón de cerrar venta se habilita y el indicador muestra "Saldo cubierto"

#### Scenario: Botón cerrar deshabilitado con saldo pendiente
- **WHEN** la suma de cobros es menor al total
- **THEN** el botón de cerrar venta permanece deshabilitado

#### Scenario: Cobro en exceso no permitido para tarjeta
- **WHEN** el operador ingresa un monto mayor al restante en un cobro que no es EFECTIVO
- **THEN** la UI impide el ingreso mostrando el máximo permitido

---

### Requirement: Ingreso de vuelto para cobros en efectivo
El sistema SHALL mostrar un campo de vuelto cuando el tipo del cobro es EFECTIVO. El operador ingresa el monto entregado por el cliente; el sistema calcula y muestra el vuelto. El cobro se registra por el valor de la venta, no por el billete entregado.

#### Scenario: Cálculo de vuelto en efectivo
- **WHEN** el operador ingresa que el cliente entregó $50.000 en un cobro EFECTIVO de $48.500
- **THEN** el campo vuelto muestra $1.500 y el cobro se registra por $48.500
