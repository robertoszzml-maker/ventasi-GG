## ADDED Requirements

### Requirement: Cabecera de venta
El sistema SHALL requerir cliente, vendedor, lista de precio y tipo de comprobante para crear una venta. La venta MUST estar vinculada a una visita con estado `COMPRA`. El tipo de comprobante SHALL sugerirse automáticamente según la condición IVA del cliente (RI → A, CF/MONO/EXENTO → B).

#### Scenario: Creación desde visita con cliente
- **WHEN** el operador abre la pantalla de venta desde una visita con cliente asignado
- **THEN** el campo cliente se pre-carga con los datos del cliente de la visita y el tipo de comprobante se sugiere automáticamente

#### Scenario: Creación desde visita sin cliente
- **WHEN** la visita no tiene cliente asignado
- **THEN** el sistema pre-carga el cliente "Consumidor Final" y sugiere tipo B

#### Scenario: Cabecera incompleta
- **WHEN** el operador intenta agregar artículos sin haber seleccionado vendedor o lista de precio
- **THEN** el sistema bloquea la acción y muestra los campos requeridos faltantes

---

### Requirement: Carga de artículos por variante
El sistema SHALL permitir buscar artículos por nombre o código y agregar una línea de detalle por cada combinación de variante (talle + color) con su cantidad. El precio unitario SHALL tomarse de la lista de precio seleccionada en la cabecera.

#### Scenario: Agregar variante con precio
- **WHEN** el operador selecciona un artículo, una variante y una cantidad
- **THEN** se agrega una línea con precio unitario de la lista de precio de la venta, descuento vacío y subtotal calculado

#### Scenario: Artículo sin precio en lista seleccionada
- **WHEN** el artículo no tiene precio definido en la lista de precio de la venta
- **THEN** el sistema pre-carga precio 0 y permite al operador editarlo manualmente antes de confirmar

#### Scenario: Variante sin stock disponible
- **WHEN** la variante seleccionada tiene stock 0 en todas las ubicaciones
- **THEN** el sistema muestra advertencia pero NO bloquea la carga (el negocio puede vender sin stock previo)

#### Scenario: Editar cantidad y descuento por línea
- **WHEN** el operador modifica la cantidad o el descuento (% o monto) de una línea
- **THEN** el subtotal de esa línea se recalcula en tiempo real

#### Scenario: Eliminar línea
- **WHEN** el operador elimina una línea de artículo
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

### Requirement: Guardar venta como borrador
El sistema SHALL permitir guardar la venta en estado `borrador` sin emitir comprobante. Un borrador puede editarse y completarse luego. Un borrador NO genera movimiento de inventario.

#### Scenario: Guardar borrador exitoso
- **WHEN** el operador presiona "Guardar borrador" con al menos un artículo cargado
- **THEN** la venta se persiste en estado `borrador` y el operador puede continuar editándola

#### Scenario: Borrador recuperable
- **WHEN** el operador vuelve a una venta en estado borrador
- **THEN** todos los datos (artículos, formas de pago, descuentos) se restauran para continuar la edición

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
