## MODIFIED Requirements

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

### Requirement: Guardar venta como borrador
**Reason**: Reemplazado por confirmación directa con el botón COBRAR. El flujo principal de venta en caja no requiere estado borrador intermedio.
**Migration**: Las ventas existentes en estado borrador se mantienen accesibles desde el listado `/ventas`. La pantalla de nueva venta ya no genera borradores — confirma directamente.

## REMOVED Requirements

### Requirement: Guardar venta como borrador
**Reason**: El flujo POS no tiene estado borrador. La venta se confirma directamente con el botón COBRAR.
**Migration**: Las ventas en estado borrador previas siguen siendo accesibles y editables desde `/ventas/[id]`. Solo la pantalla de nueva venta deja de generar borradores.
