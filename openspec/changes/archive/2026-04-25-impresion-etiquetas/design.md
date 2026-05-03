## Context

`ArticuloVariante` (talle+color) tiene `cantidad` y umbrales de stock, pero no código de barras propio. `Articulo` tiene `codigoBarras` a nivel artículo — insuficiente para textil donde cada variante necesita escaneo diferenciado. El proyecto usa `window.print()` para impresión (patrón en `/print/ventas/[id]/page.tsx`): ruta dedicada, CSS `@page` con dimensiones, `window.print()` automático al cargar. El sistema está deployado en un VPS (DonWeb); el backend no puede iniciar conexiones hacia las PCs del usuario. La impresora Zebra GK420T está conectada por USB a una PC local que accede al sistema via browser. La tabla `config` (clave/valor) es para configuración de empresa — la config de impresora es por máquina, no por empresa.

## Goals / Non-Goals

**Goals:**
- Imprimir etiquetas por variante desde dos flujos: movimiento de ingreso y selección directa de artículos.
- Soporte dual para código de barras: proveedor (cargado manualmente) o auto-generado deterministicamente.
- Configuración de dimensiones, campos visibles y modo de impresión por máquina (localStorage).
- Preview en vivo de la etiqueta antes de imprimir, tanto en preparación como en configuración.
- Sin instalación de software adicional en la PC del usuario.

**Non-Goals:**
- Múltiples plantillas de etiqueta simultáneas (una plantilla activa por máquina).
- Impresión en red directa desde servidor (no aplica: VPS no tiene acceso a la red local).
- Generación de EAN-13 válidos con dígito verificador para auto-generados (se usa Code128 libre).
- Historial de etiquetas impresas.
- Integración con Zebra Browser Print u otras apps de Zebra.
- Importación masiva de códigos de barras por CSV (fuera de alcance actual).

## Decisions

### 1. Web Serial API + window.print() como fallback

Web Serial API (Chrome 89+, disponible en todos los Chrome actuales) envía bytes ZPL directamente al puerto USB de la Zebra sin abrir ningún diálogo. El usuario autoriza el dispositivo una única vez en Chrome; la autorización se persiste. El sistema está en HTTPS (VPS), cumpliendo el requisito de Web Serial. Para browsers sin soporte (Firefox) o usuarios que prefieran el diálogo nativo, `window.print()` actúa como fallback. El modo se configura en `/config/impresora-etiquetas` y se guarda en `localStorage`.

**Alternativa descartada: print-agent local**. Requeriría instalar un proceso Node.js en cada PC con la Zebra — exactamente lo que se quería evitar.

### 2. ZPL generado en el frontend, no en el backend

La lógica de qué campos mostrar en la etiqueta y su layout vive en el frontend junto con el componente de preview. Para Web Serial mode, se genera un string ZPL desde el frontend. Para `window.print()` mode, se usa HTML/CSS con SVG barcodes. El backend no necesita conocer el formato de etiqueta.

**Alternativa descartada**: endpoint backend que genera ZPL. Agrega una capa de complejidad y acopla el backend a una lógica de presentación.

### 3. `codigo_barras` en `articulo_variante`, nullable, sin persistir el auto-generado

Si `codigo_barras IS NULL`, el sistema calcula en runtime: `ART{articuloId:04d}T{talleId:03d}C{colorId:03d}` (Code128). El código auto-generado es deterministico — siempre da el mismo resultado para la misma variante. No se persiste porque puede recalcularse cuando se necesite. El usuario puede cargar el código del proveedor editando la variante en cualquier momento.

**Alternativa descartada**: auto-generar y persistir al crear la variante. Innecesario y agrega complejidad a un flujo de creación que hoy es simple.

### 4. Cada etiqueta = una página CSS con `page-break-after: always`

`@page { size: {ancho}mm {alto}mm; margin: 0; }` en la ruta `/print/etiquetas`. Cada etiqueta (componente `EtiquetaLabel`) tiene `page-break-after: always`. Si una variante tiene cantidad 12, se renderizan 12 instancias del componente consecutivas. El driver ZDesigner de Zebra interpreta cada salto de página como fin de etiqueta y avanza el stock físicamente — esto es el "paso entre etiquetas". Consistente con el patrón existente de `/print/ventas/`.

### 5. SVG barcodes con JsBarcode para `window.print()` mode

Los códigos de barras se renderizan como SVG (no canvas, no `<img>`). SVG es vectorial y escala perfectamente al DPI nativo de la Zebra (203dpi) a través del driver de Windows, evitando el blur del rasterizado de imágenes. JsBarcode tiene salida SVG nativa. Para Web Serial mode, el barcode se genera como comando ZPL `^BCN` directamente.

### 6. Configuración en `localStorage`, no en tabla `config`

La tabla `config` persiste configuración de empresa (compartida entre todas las PCs). La configuración de impresora (qué impresora está conectada, dimensiones del stock de etiquetas, campos visibles) es específica de la máquina donde está la Zebra. `localStorage` con clave `etiqueta_config` es el lugar correcto. Sin roundtrip al backend para cargar la config en cada impresión.

### 7. Datos a `/print/etiquetas` via query param base64

La ruta `/print/etiquetas` recibe las variantes + cantidades + config codificadas en base64 como query param `data`. Evita estado global compartido entre páginas y es consistente con el patrón de rutas de impresión del proyecto.

### 8. Endpoint dedicado `GET /articulos/variantes-para-etiquetas`

Devuelve artículos con sus variantes (nombre artículo, nombre talle, nombre color, codigo_barras) en una query optimizada con JOINs, sin N+1. El flujo de movimiento reutiliza el detalle del movimiento ya existente (que incluye `articuloVariante` con relaciones).

## Risks / Trade-offs

- **Web Serial y drivers**: en algunas configuraciones de Windows, el driver ZDesigner de Zebra puede no exponer el puerto COM virtual necesario para Web Serial. El fallback a `window.print()` mitiga esto completamente.
- **Cantidad de etiquetas en DOM**: si una variante tiene 50 unidades y hay 20 variantes, se renderizan 1000 componentes en el DOM antes del print. Para cantidades extremas puede haber lag. Mitigación: advertir al usuario si el total supera 500 etiquetas.
- **Auto-generados no son EAN-13**: los códigos auto-generados son Code128 libre, no escaneables en sistemas que requieran EAN-13. Esto es documentable en la UI con el tooltip "Si está vacío, el sistema genera uno automáticamente (Code128)".

## Migration Plan

1. Ejecutar migración SQL: ALTER TABLE en `articulo_variante`.
2. Deploy backend: nuevo endpoint y campo opcional en DTOs. Sin breaking changes.
3. Deploy frontend: nuevas páginas y campo en formulario de variante.
4. El usuario configura `/config/impresora-etiquetas` en la PC con la Zebra (una sola vez).
