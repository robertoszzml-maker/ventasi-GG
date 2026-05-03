## ADDED Requirements

### Requirement: Layout POS de 2 columnas estático
El sistema SHALL presentar la pantalla de nueva venta como un layout de 2 columnas fijas en una sola página. La columna izquierda MUST contener la búsqueda de artículos y la grilla de variantes. La columna derecha MUST contener el carrito, el totalizador, los métodos de pago y el botón de confirmación. No SHALL haber navegación a otras pantallas durante el proceso de venta.

#### Scenario: Todo en una sola pantalla
- **WHEN** el operador accede a `/ventas/nueva`
- **THEN** ve en pantalla simultáneamente: chips de vendedor, búsqueda de cliente, búsqueda de artículos, carrito, total y métodos de pago

#### Scenario: Sin modales ni dialogs
- **WHEN** el operador interactúa con cualquier parte de la pantalla de venta
- **THEN** ninguna acción abre un dialog o navega a otra página

---

### Requirement: Selección de vendedor por chips
El sistema SHALL mostrar los vendedores activos como chips/botones de selección directa en el header. Un click en un chip SHALL seleccionar ese vendedor. El chip seleccionado SHALL mostrarse visualmente diferenciado.

#### Scenario: Click en chip selecciona vendedor
- **WHEN** el operador hace click en el chip con el nombre de un vendedor
- **THEN** ese vendedor queda seleccionado y su chip se muestra como activo

#### Scenario: Solo vendedores activos visibles
- **WHEN** se cargan los chips de vendedor
- **THEN** solo se muestran vendedores con `activo = true`

---

### Requirement: Búsqueda de artículos inline con grilla de variantes
El sistema SHALL mostrar un campo de búsqueda de artículos siempre visible en la columna izquierda. Al seleccionar un artículo con múltiples variantes, la grilla (filas=talles, columnas=colores, celdas=stock) SHALL aparecer inline en el mismo panel reemplazando la lista de resultados. Un click en una celda de la grilla con stock > 0 SHALL agregar esa variante al carrito con cantidad=1 y SHALL volver automáticamente a la búsqueda.

#### Scenario: Búsqueda muestra resultados
- **WHEN** el operador escribe 2 o más caracteres en el campo de búsqueda
- **THEN** aparece una lista de artículos coincidentes con nombre y precio

#### Scenario: Click en artículo muestra grilla
- **WHEN** el operador hace click en un artículo con múltiples variantes
- **THEN** la grilla de talles × colores reemplaza la lista de resultados en el panel izquierdo

#### Scenario: Click en celda agrega al carrito
- **WHEN** el operador hace click en una celda de la grilla con stock > 0
- **THEN** la variante se agrega al carrito con cantidad=1 y el panel vuelve a mostrar el campo de búsqueda

#### Scenario: Celda sin stock deshabilitada
- **WHEN** una celda de la grilla tiene stock = 0
- **THEN** la celda aparece visualmente deshabilitada y no es clickeable

#### Scenario: Artículo sin variante agrega directo
- **WHEN** el operador hace click en un artículo con una única variante (accesorio sin talle/color)
- **THEN** la variante se agrega directamente al carrito sin mostrar grilla

---

### Requirement: Carrito simplificado con controles inline
El sistema SHALL mostrar los artículos del carrito como una lista vertical en la columna derecha. Cada línea SHALL mostrar: nombre del artículo, variante (talle/color), botones [−] y [+] para cantidad, precio unitario, subtotal de línea y botón de eliminar. El descuento por línea SHALL estar colapsado detrás de un botón "%" que al hacer click expande inputs inline de descuento (% o $) sin abandonar la pantalla.

#### Scenario: Controles de cantidad
- **WHEN** el operador presiona [+] o [−] en una línea del carrito
- **THEN** la cantidad se incrementa o decrementa y el subtotal de línea y el total se recalculan en tiempo real

#### Scenario: Descuento por línea colapsado
- **WHEN** el operador hace click en el botón "%" de una línea
- **THEN** aparecen inputs inline de descuento (% y $) en esa línea sin abrir ningún modal

#### Scenario: Eliminar línea del carrito
- **WHEN** el operador hace click en el botón de eliminar de una línea
- **THEN** la línea desaparece y el total se recalcula

---

### Requirement: Comprobante auto-sugerido y colapsado
El sistema SHALL auto-sugerir el tipo de comprobante basándose en la condición IVA del cliente seleccionado (RI → A, CF/MT/EX → B) y mostrarlo como un badge compacto junto al nombre del cliente. El badge SHALL ser clickeable para desplegar las opciones de tipo de comprobante solo cuando el operador necesite cambiarlo manualmente.

#### Scenario: Comprobante auto-sugerido al seleccionar cliente
- **WHEN** el operador selecciona un cliente con condición IVA conocida
- **THEN** el tipo de comprobante se auto-sugiere y se muestra como badge compacto (ej: "Fact. B")

#### Scenario: Cambio manual de comprobante
- **WHEN** el operador hace click en el badge de comprobante
- **THEN** se despliegan las opciones disponibles para cambiar el tipo manualmente

---

### Requirement: Pago rápido por pills de método
El sistema SHALL mostrar los métodos de pago activos como pills/botones grandes. Al hacer click en un pill, SHALL agregarse un pago con ese método pre-llenando el monto con el saldo restante. Si se necesita dividir el pago, un botón "+" SHALL permitir agregar otro método adicional.

#### Scenario: Click en pill pre-llena saldo restante
- **WHEN** el operador hace click en un pill de método de pago
- **THEN** se agrega un pago con ese método y el monto del saldo pendiente, mostrando "Saldo cubierto" si queda en cero

#### Scenario: Pago dividido
- **WHEN** el operador hace click en "+" después de agregar un pago parcial
- **THEN** puede seleccionar otro método y monto para cubrir el saldo restante

---

### Requirement: Botón COBRAR único con confirmación directa
El sistema SHALL mostrar un único botón prominente "COBRAR $XX.XXX" en la columna derecha. Al presionarlo, SHALL guardar y confirmar la venta en un solo paso sin navegar a otra pantalla. El botón SHALL estar deshabilitado hasta que haya vendedor, cliente, al menos 1 artículo y saldo cubierto.

#### Scenario: COBRAR habilitado con todos los datos
- **WHEN** el operador tiene vendedor, cliente, al menos 1 artículo y saldo cubierto
- **THEN** el botón COBRAR está habilitado y muestra el monto total

#### Scenario: COBRAR confirma y guarda directamente
- **WHEN** el operador presiona COBRAR
- **THEN** la venta se guarda como confirmada, se genera el movimiento de stock en el backend y se muestra confirmación visual en la misma pantalla (sin navegar a otra página)

#### Scenario: COBRAR deshabilitado con datos incompletos
- **WHEN** falta vendedor, cliente, artículos o el saldo no está cubierto
- **THEN** el botón COBRAR está deshabilitado con un texto indicativo del requisito pendiente
