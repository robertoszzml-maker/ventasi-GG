## MODIFIED Requirements

### Requirement: Selector de tipo de operación en el POS
El sistema SHALL mostrar en el header del POS un selector de `tipo_operacion` con las opciones: Venta, Nota de Crédito, Nota de Débito. El valor por defecto MUST ser 'Venta'. Al seleccionar NC o ND, el sistema SHALL habilitar un campo de búsqueda de venta origen (opcional).

#### Scenario: POS inicia en modo Venta por defecto
- **WHEN** el operador accede a `/ventas/nueva`
- **THEN** el selector de tipo muestra 'Venta' seleccionado y el campo de venta origen está oculto

#### Scenario: Cambio a modo Nota de Crédito
- **WHEN** el operador selecciona 'Nota de Crédito' en el selector de tipo
- **THEN** aparece el campo de búsqueda de venta origen (opcional), el carrito permanece igual y el botón de confirmar dice 'Emitir NC'

#### Scenario: Cambio a modo Nota de Débito
- **WHEN** el operador selecciona 'Nota de Débito' en el selector de tipo
- **THEN** aparece el campo de búsqueda de venta origen (opcional) y el botón de confirmar dice 'Emitir ND'

#### Scenario: Confirmación registra el tipo correcto
- **WHEN** el operador confirma con tipo 'nota_credito'
- **THEN** el registro creado tiene `tipo_operacion = 'nota_credito'` y se genera el comprobante del tipo correspondiente
