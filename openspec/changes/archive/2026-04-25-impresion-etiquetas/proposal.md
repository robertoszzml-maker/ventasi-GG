## Why

El sistema no tiene forma de imprimir etiquetas de identificación para las variantes de artículos. En el rubro textil, cada combinación talle+color necesita su propia etiqueta con código de barras individual, ya que la misma prenda en dos talles es un SKU distinto en el punto de venta. Hoy el proceso se hace con herramientas externas sin integración con el inventario: el operador no puede imprimir etiquetas al hacer un ingreso de mercadería, ni puede seleccionar artículos del sistema para imprimir en lote. Adicionalmente, el campo `codigo_barras` existe solo a nivel artículo, no por variante, lo que impide el escaneo diferenciado en caja.

## What Changes

- **Nuevo campo `codigo_barras` en `articulo_variante`**: soporta dos modos operativos. Modo proveedor: el operador carga el código del proveedor editando la variante. Modo auto-generado: si el campo está vacío, el sistema genera un código deterministico en runtime sin persistirlo.
- **Pantalla `/etiquetas/nueva`**: selección de artículos con multi-selección para generar etiquetas en lote.
- **Pantalla `/etiquetas/preparar`**: configuración de cantidades por variante con preview en vivo de la etiqueta. Accesible desde movimiento de ingreso (cantidades pre-cargadas desde el movimiento) o desde selección de artículos.
- **Ruta `/print/etiquetas`**: renderiza las etiquetas como páginas CSS del tamaño configurado. Cada etiqueta es una página CSS con `page-break-after: always` — la Zebra avanza el stock entre etiquetas por el salto de página.
- **Mecanismo de impresión dual**: Web Serial API como opción primaria (envía ZPL directo al USB sin diálogo), `window.print()` como fallback (usa el diálogo nativo del OS).
- **Configuración por máquina en `localStorage`**: dimensiones de etiqueta (ancho × alto en mm), campos visibles (título, talle, color, código de barras, precio, SKU), modo de impresión.
- **Botón "Imprimir etiquetas"** en la página de detalle de movimiento de inventario para el flujo de ingreso de mercadería.

## Capabilities

### New Capabilities

- `codigo-barras-variante`: campo `codigo_barras` en `articulo_variante` con lógica dual proveedor/auto-generado.
- `impresion-etiquetas`: pantallas de selección de artículos, preparación de cantidades, preview y ruta de impresión.
- `config-impresora-etiquetas`: configuración por máquina en `localStorage` (dimensiones, campos, modo de impresión).

### Modified Capabilities

- `movimientos-inventario`: agrega punto de entrada para imprimir etiquetas desde la página de detalle de un movimiento de ingreso.

## Impact

- **Backend**: migración SQL (ALTER TABLE en `articulo_variante`), `articulo-variante.entity.ts`, DTOs de variante, nuevo endpoint `GET /articulos/variantes-para-etiquetas`.
- **Frontend**: 3 nuevas páginas (`/etiquetas/nueva`, `/etiquetas/preparar`, `/config/impresora-etiquetas`), nueva ruta de impresión (`/print/etiquetas`), hook `useEtiquetaConfig`, hook `useWebSerial`, componente `EtiquetaPreview`, campo en formulario de variante, botón en detalle de movimiento.
- **Base de datos**: ALTER TABLE en `articulo_variante`, campo `codigo_barras VARCHAR(100) NULL`.
- **Sin breaking changes**: el campo es aditivo y nullable; APIs existentes sin cambios.
