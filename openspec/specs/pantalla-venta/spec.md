## ADDED Requirements

### Requirement: Cabecera de venta
El sistema SHALL requerir vendedor, cliente y tipo de comprobante para confirmar una venta. La lista de precios SHALL cargarse automáticamente usando la lista por defecto (`esDefault = 1`) al iniciar la pantalla. El tipo de comprobante SHALL sugerirse automáticamente según la condición IVA del cliente (RI → A, CF/MONO/EXENTO → B) y mostrarse colapsado como badge compacto; solo se despliega para edición manual. El vendedor SHALL seleccionarse mediante chips de 1 click, no mediante un select dropdown.

#### Scenario: Lista de precios por defecto al iniciar
- **WHEN** el operador abre la pantalla de nueva venta
- **THEN** la lista de precios se pre-selecciona automáticamente con la lista marcada como default

#### Scenario: Vendedor seleccionado por chip
- **WHEN** el operador hace click en el chip de un vendedor activo
- **THEN** ese vendedor queda asignado a la venta

#### Scenario: Comprobante auto-sugerido colapsado
- **WHEN** el operador selecciona un cliente con condición IVA conocida
- **THEN** el tipo de comprobante se auto-sugiere y se muestra como badge compacto sin requerir acción del operador

#### Scenario: Cambio manual de comprobante
- **WHEN** el operador hace click en el badge de tipo de comprobante
- **THEN** se despliegan las opciones para cambiar el tipo manualmente

---

### Requirement: Carga de artículos por variante
El sistema SHALL permitir buscar artículos por nombre o código y agregar variantes directamente desde una grilla inline en el panel de búsqueda, sin abrir un dialog. El precio unitario SHALL tomarse de la lista de precio por defecto o la seleccionada. Un click en una celda de la grilla con stock disponible SHALL agregar la variante al carrito con cantidad=1 inmediatamente.

#### Scenario: Agregar variante desde grilla inline
- **WHEN** el operador hace click en una celda de la grilla con stock > 0
- **THEN** se agrega una línea al carrito con precio de lista, cantidad=1 y subtotal calculado, y el panel vuelve a la búsqueda

#### Scenario: Artículo sin precio en lista seleccionada
- **WHEN** el artículo no tiene precio definido en la lista de precio activa
- **THEN** el sistema agrega la línea con precio 0 y permite al operador editarlo en el carrito

#### Scenario: Variante sin stock disponible
- **WHEN** la variante tiene stock 0
- **THEN** la celda de la grilla aparece deshabilitada; el operador NO puede agregarla desde la grilla

#### Scenario: Editar cantidad y descuento por línea en carrito
- **WHEN** el operador modifica la cantidad con [−]/[+] o expande el descuento con el botón "%"
- **THEN** el subtotal de línea y el total se recalculan en tiempo real

#### Scenario: Eliminar línea
- **WHEN** el operador hace click en eliminar en una línea del carrito
- **THEN** la línea desaparece y los totales se recalculan

---

### Requirement: Descuento por artículo
El sistema SHALL permitir aplicar descuento a cada línea de detalle, ya sea en porcentaje o en monto fijo. Solo uno de los dos puede estar activo por línea. El subtotal de línea SHALL ser `cantidad * precio_unitario * (1 - descuento_pct/100) - descuento_monto`.

#### Scenario: Descuento por porcentaje en línea
- **WHEN** el operador ingresa descuento_porcentaje en una línea
- **THEN** el campo descuento_monto se limpia y el subtotal refleja el descuento porcentual

#### Scenario: Descuento por monto en línea
- **WHEN** el operador ingresa descuento_monto en una línea
- **THEN** el campo descuento_porcentaje se limpia y el subtotal refleja el descuento fijo

---

### Requirement: Totalizador con descuento/recargo global e IVA
El sistema SHALL calcular en tiempo real: subtotal (suma de líneas), descuento global (% o monto), recargo global (% o monto), base imponible, IVA 21% y total. El orden de aplicación SHALL ser: subtotal → descuento global → recargo global → base imponible → IVA 21%.

#### Scenario: Cálculo de totales en tiempo real
- **WHEN** el operador modifica cualquier línea, descuento o recargo
- **THEN** todos los campos del totalizador se recalculan automáticamente sin recargar la página

#### Scenario: Descuento global por porcentaje
- **WHEN** el operador ingresa descuento_porcentaje global
- **THEN** el campo descuento_monto global se limpia y el totalizador muestra el descuento aplicado sobre el subtotal

#### Scenario: Recargo global por porcentaje
- **WHEN** el operador ingresa recargo_porcentaje global
- **THEN** el campo recargo_monto global se limpia y el totalizador muestra el recargo aplicado

#### Scenario: IVA calculado sobre base imponible
- **WHEN** el totalizador tiene base imponible calculada
- **THEN** IVA = base_imponible * 0.21 y total = base_imponible + IVA

---

~~### Requirement: Guardar venta como borrador~~
**Eliminado** — Reemplazado por confirmación directa con el botón COBRAR. El flujo principal de venta en caja no requiere estado borrador intermedio. Las ventas existentes en estado borrador se mantienen accesibles desde el listado `/ventas`; la pantalla de nueva venta confirma directamente sin generar borradores.

---

### Requirement: Confirmar venta y generación de movimiento de stock
Al confirmar la venta (emitir comprobante), el sistema SHALL cambiar el estado a `confirmada`, generar automáticamente un `MovimientoInventario` de tipo EGRESO con los detalles de la venta, y actualizar `visita.venta_id`. Todo en una única transacción.

#### Scenario: Confirmación exitosa
- **WHEN** el operador confirma la venta con saldo restante = 0 y vendedor seleccionado
- **THEN** el estado cambia a `confirmada`, se genera el movimiento EGRESO, se actualiza `visita.venta_id`, y se habilita la emisión del comprobante

#### Scenario: Rollback ante error de stock
- **WHEN** alguna variante no tiene stock suficiente al confirmar
- **THEN** el sistema muestra advertencia pero permite confirmar igualmente (el stock puede quedar negativo — el negocio lo acepta)

#### Scenario: Venta confirmada no editable
- **WHEN** el operador intenta modificar una venta en estado `confirmada`
- **THEN** el sistema retorna error indicando que la venta ya fue confirmada

---

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
