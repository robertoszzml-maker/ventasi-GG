## Context

La pantalla actual de nueva venta fue construida como formulario backoffice en múltiples componentes desacoplados (cabecera, tabla, totalizador, formas de pago, dialog de artículos). El flujo obliga a completar datos administrativos antes de poder cargar artículos, y cada artículo requiere abrir un dialog con 6+ pasos. El backend y la API no cambian — todo el impacto es frontend.

Usuarias objetivo: vendedoras sin formación técnica, operando con filas de 10+ clientes. Dispositivo: desktop/laptop con teclado y mouse.

## Goals / Non-Goals

**Goals:**
- Reducir la venta de 1 artículo a 7-8 clicks máximo
- Eliminar el dialog de artículos — grilla inline visible en la pantalla principal
- Layout estático de 2 columnas: búsqueda+grilla (izquierda) y carrito+pago (derecha)
- Vendedor como chips de 1 click (máx 4 activos por turno)
- Comprobante auto-sugerido y colapsado — visible solo cuando hay que cambiarlo
- Botón único COBRAR que guarda y confirma directamente
- Sin cambios en el backend ni en la API existente

**Non-Goals:**
- Cambios en la pantalla de detalle de venta (`/ventas/[id]`)
- Cambios en el modelo de datos o migraciones SQL
- Soporte para tablet/mobile (la pantalla es desktop-first)
- Reimplementar lógica de cálculo de totales o IVA

## Decisions

### D1: Layout de 2 columnas fijas, sin stepper

**Decisión:** Una sola pantalla dividida en columna izquierda (búsqueda + grilla de variantes) y columna derecha (carrito + pago + COBRAR). Sin stepper, sin tabs, sin navegación.

**Rationale:** Un stepper obligaría a las usuarias a ir y volver entre pasos. Con 2 columnas todo es visible simultáneamente: buscan artículos en la izquierda y ven el carrito crecer en la derecha. El total y el botón COBRAR son siempre visibles.

**Alternativa descartada:** Stepper de 3 pasos (Cliente → Artículos → Pago). Descartado porque añade navegación y oculta información relevante.

### D2: Grilla de talles/colores inline en columna izquierda

**Decisión:** Al hacer click en un artículo del resultado de búsqueda, la grilla (filas=talles, columnas=colores, celdas=stock) aparece en el panel izquierdo reemplazando la lista de resultados. Click en una celda agrega la variante al carrito con cantidad=1 y vuelve automáticamente a la búsqueda.

**Rationale:** Elimina el dialog completamente. La grilla ocupa el espacio de resultados de búsqueda — no hay modal, no hay overlay, no hay paso extra de confirmación.

**Artículos sin variante (accesorios):** Si el artículo tiene una sola variante (talle=null, color=null), el click en el resultado la agrega directamente al carrito sin mostrar grilla.

### D3: Vendedor como chips de 1 click

**Decisión:** Los vendedores activos se muestran como botones pill en el header. Click = seleccionado. Sin dropdown, sin scroll. Si hay más de 6, se muestran solo los activos del turno actual (filtrado por `activo=true`).

**Rationale:** Es el campo que más veces se repite en la operación diaria. Un chip es 1 click vs 2-3 del select.

### D4: Comprobante colapsado con auto-sugerencia

**Decisión:** El tipo de comprobante se muestra como un badge pequeño junto al cliente (ej: "Fact. B"). Se auto-calcula al seleccionar cliente según condición IVA. Solo es interactivo (clickeable → despliega opciones) cuando el operador quiere cambiarlo manualmente.

**Rationale:** En el 80%+ de las ventas el comprobante no necesita cambio manual. Mostrarlo como un select siempre visible consume espacio visual y tiempo cognitivo innecesario.

### D5: Descuento por línea colapsado, accesible con 1 click

**Decisión:** Cada línea del carrito muestra un pequeño botón "%" que expande inputs inline de descuento (% o $). El descuento global se mantiene en un panel colapsable al final del carrito.

**Rationale:** El descuento es frecuente pero no en cada línea de cada venta. Ocultarlo como default limpia la vista; 1 click lo trae sin cambiar de pantalla.

### D6: Pills de método de pago que pre-llenan el monto

**Decisión:** Efectivo / Débito / Crédito / Transferencia como botones grandes. Click = agrega un pago con ese método pre-llenando el saldo restante. Si se necesita dividir el pago, hay un "+" para agregar otro método.

**Rationale:** La mayoría de las ventas se pagan con un solo método. Pre-llenar el monto restante elimina el input manual en el caso más común.

### D7: Un solo botón COBRAR que confirma directamente

**Decisión:** El botón "COBRAR $XX.XXX" reemplaza "Guardar como borrador". Guarda y confirma la venta en un solo paso. La lógica de generación de comprobante y movimiento de stock ocurre en el backend sin intervención del operador.

**Rationale:** "Guardar borrador" y luego "Confirmar" era un flujo de 2 pasos innecesario para el caso de uso principal (venta en caja). El borrador puede ser recuperado pero no debe ser el flujo primario.

**Habilitación:** El botón se habilita cuando hay vendedor + cliente + al menos 1 artículo + saldo cubierto.

## Risks / Trade-offs

- **[Riesgo] Pérdida del flujo de borrador** → Las ventas confirmadas no son editables. Si el operador confirma por error, necesita un flujo de anulación. Mitigación: el botón COBRAR pide confirmación visual (color verde prominente + texto claro con el monto) pero no agrega un paso extra de confirmación en otra pantalla.

- **[Riesgo] Lista larga de artículos en grilla** → Si un artículo tiene muchos talles y colores, la grilla puede ser grande. Mitigación: la grilla usa scroll interno, no ocupa más que el panel izquierdo.

- **[Trade-off] Sin borrador explícito** → El flujo nuevo no tiene un "guardar borrador". Si se necesita recuperar una venta a medias, no es posible con este diseño. Decisión aceptada: el caso de uso principal es venta rápida en caja, no edición diferida.
