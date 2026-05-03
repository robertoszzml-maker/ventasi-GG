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

---

### Requirement: Guard de sesión de caja activa
El sistema SHALL verificar que existe una sesión de caja con estado 'abierta' antes de permitir crear o confirmar una venta, nota de crédito o nota de débito. Si no hay sesión abierta, el POS MUST mostrar un mensaje de bloqueo con un enlace para ir a abrir la caja.

#### Scenario: POS bloqueado sin sesión activa
- **WHEN** el operador accede a `/ventas/nueva` y no hay sesión de caja abierta
- **THEN** el sistema muestra un aviso de "Caja cerrada" con un botón que redirige a la pantalla de apertura de caja

#### Scenario: POS disponible con sesión activa
- **WHEN** el operador accede a `/ventas/nueva` y existe una sesión de caja abierta
- **THEN** el POS carga normalmente y permite operar

---

## REMOVED Requirements

### Requirement: Pago rápido por pills de método
**Reason**: Reemplazado por el flujo de cobros con código rápido, grilla de botones y panel de monto restante. El modelo de `medio_pago` con código rápido hace obsoleto el concepto de "pill" genérico.
**Migration**: Ver requirements ADDED a continuación.

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
