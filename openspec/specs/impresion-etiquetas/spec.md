## ADDED Requirements

### Requirement: Imprimir etiquetas desde movimiento de ingreso
El sistema SHALL mostrar un botón "Imprimir etiquetas" en la página de detalle de un movimiento de inventario. Al hacer click, SHALL navegar a `/etiquetas/preparar?movimientoId={id}` con las cantidades pre-cargadas desde las cantidades del movimiento (una etiqueta por unidad ingresada como punto de partida).

#### Scenario: Botón visible en movimiento con detalles
- **WHEN** el operador accede al detalle de un movimiento que tiene al menos un detalle de variante
- **THEN** el botón "Imprimir etiquetas" es visible

#### Scenario: Cantidades pre-cargadas desde el movimiento
- **WHEN** el operador llega a la pantalla de preparación desde un movimiento con 12 unidades de variante A y 8 de variante B
- **THEN** la variante A aparece con cantidad 12 y la variante B con cantidad 8 como valores iniciales

---

### Requirement: Imprimir etiquetas desde selección de artículos
El sistema SHALL proveer una pantalla `/etiquetas/nueva` donde el operador puede seleccionar uno o más artículos mediante checkboxes. Al confirmar, SHALL navegar a `/etiquetas/preparar?articuloIds=1,2,3` con todas las variantes activas de los artículos seleccionados y cantidades iniciales en 1.

#### Scenario: Selección de múltiples artículos
- **WHEN** el operador selecciona 3 artículos y hace click en "Preparar etiquetas"
- **THEN** navega a la pantalla de preparación con todas las variantes de los 3 artículos, cantidad inicial = 1 por variante

#### Scenario: Artículo sin variantes activas
- **WHEN** el operador selecciona un artículo que no tiene variantes activas
- **THEN** el artículo no aparece en la pantalla de preparación (no genera filas)

---

### Requirement: Configurar cantidades por variante con preview en vivo
La pantalla `/etiquetas/preparar` SHALL mostrar un layout de dos columnas: panel izquierdo con las variantes agrupadas por artículo → color, con filas por talle y campo de cantidad editable; panel derecho con el preview de la etiqueta de la variante actualmente seleccionada o con hover. El total de etiquetas SHALL calcularse en tiempo real.

#### Scenario: Ajustar cantidad con botones
- **WHEN** el operador hace click en [+] o [−] junto a una variante
- **THEN** la cantidad aumenta o disminuye en 1; el total general se actualiza

#### Scenario: Ingresar cantidad manual
- **WHEN** el operador escribe directamente en el input de cantidad
- **THEN** el valor se actualiza y el total general se recalcula

#### Scenario: Cantidad cero excluye la variante
- **WHEN** una variante tiene cantidad = 0
- **THEN** no se genera ninguna etiqueta para esa variante al imprimir

#### Scenario: Preview actualiza al cambiar variante activa
- **WHEN** el operador hace hover o click sobre una fila de variante
- **THEN** el panel derecho muestra el preview de la etiqueta para esa variante específica

---

### Requirement: Impresión sin diálogo via Web Serial (modo primario)
En modo Web Serial configurado, al hacer click en "Imprimir" el sistema SHALL: conectar al puerto guardado, generar el ZPL para todas las variantes × cantidades (con `^PQ{cantidad}` por variante), enviarlo al puerto serie, y cerrar la pestaña de impresión. No SHALL abrir ningún diálogo del OS.

#### Scenario: Impresión exitosa via Web Serial
- **WHEN** el operador hace click en "Imprimir" con modo Web Serial activo y la Zebra conectada
- **THEN** las etiquetas se imprimen directamente sin ningún diálogo; la pestaña se cierra

#### Scenario: Puerto no disponible en Web Serial
- **WHEN** el operador intenta imprimir via Web Serial pero el puerto no está disponible
- **THEN** el sistema muestra un error y ofrece reintentar o cambiar a modo Sistema

---

### Requirement: Impresión con diálogo via window.print() (modo fallback)
En modo Sistema, la ruta `/print/etiquetas` SHALL renderizar N páginas CSS (`@page { size: {ancho}mm {alto}mm; margin: 0; }`) con una etiqueta por página. Si una variante tiene cantidad 5, se renderizan 5 páginas idénticas para esa variante. Entre variantes no hay separador especial — cada página es una etiqueta. `window.print()` SHALL dispararse automáticamente al cargar los datos.

#### Scenario: Etiquetas renderizadas con dimensiones configuradas
- **WHEN** la ruta `/print/etiquetas` carga con configuración ancho=50mm, alto=30mm
- **THEN** cada etiqueta ocupa exactamente 50×30mm en el diálogo de impresión

#### Scenario: Cantidad de páginas correcta
- **WHEN** hay 3 variantes con cantidades 12, 8 y 5
- **THEN** se renderizan exactamente 25 páginas en el diálogo de impresión

#### Scenario: Paso entre etiquetas
- **WHEN** la Zebra imprime las etiquetas via diálogo del OS
- **THEN** el driver ZDesigner interpreta cada salto de página CSS como fin de etiqueta y avanza el stock físicamente entre etiquetas

---

### Requirement: Preview de etiqueta a escala real
El componente `EtiquetaPreview` SHALL renderizar la etiqueta con las dimensiones reales configuradas (en mm), usando un factor de escala configurable para la pantalla. SHALL mostrar SVG barcode para el código de barras (Code128), y los campos configurados en `localStorage`. Si `codigo_barras` de la variante es null, SHALL mostrar el código auto-generado.

#### Scenario: Preview a escala 3x para visibilidad
- **WHEN** el preview se muestra en la pantalla de preparación
- **THEN** la etiqueta se renderiza a 3 veces su tamaño real para facilitar la lectura, manteniendo proporciones

#### Scenario: Barcode auto-generado visible en preview
- **WHEN** la variante no tiene `codigo_barras` propio
- **THEN** el preview muestra el barcode auto-generado `ART0023T004C007` con el texto debajo
