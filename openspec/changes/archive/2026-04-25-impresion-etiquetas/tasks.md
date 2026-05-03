## 1. Migración SQL

- [x] 1.1 Crear `packages/api/sql/7.sql` con `ALTER TABLE articulo_variante ADD COLUMN codigo_barras VARCHAR(100) NULL`

## 2. Backend — ArticuloVariante

- [x] 2.1 Agregar `codigoBarras` a `articulo-variante.entity.ts` como `@Column({ name: 'codigo_barras', type: 'varchar', length: 100, nullable: true })`
- [x] 2.2 Agregar `@IsOptional() @IsString() codigoBarras?: string` a `create-articulo-variante.dto.ts`
- [x] 2.3 Agregar `@IsOptional() @IsString() codigoBarras?: string` a `update-articulo-variante.dto.ts`

## 3. Backend — Endpoint variantes para etiquetas

- [x] 3.1 Agregar endpoint `GET /articulos/variantes-para-etiquetas?articuloIds=1,2,3` en `ArticuloController`
- [x] 3.2 Implementar `getVariantesParaEtiquetas(articuloIds: number[])` en `ArticuloService`: query con JOIN `articulo → articulo_variante → talle → color`, retorna array de `{ articuloId, articuloNombre, varianteId, talleNombre, colorNombre, codigoBarras }`

## 4. Frontend — Infraestructura compartida

- [x] 4.1 Agregar `jsbarcode` a dependencias de `packages/front`
- [x] 4.2 Crear `packages/front/src/lib/etiqueta.ts` con:
  - `generarCodigoBarras(variante)`: retorna `variante.codigoBarras` si existe, sino `ART{articuloId:04d}T{talleId:03d}C{colorId:03d}`
  - `generarZpl(variantes, config)`: genera string ZPL completo con `^XA…^XZ` por variante y `^PQ{cantidad}` para repeticiones
  - `codificarDatosEtiqueta(variantes, config)`: serializa a JSON → base64 para query param
  - `decodificarDatosEtiqueta(base64)`: inverso
- [x] 4.3 Crear `packages/front/src/hooks/etiqueta-config.ts` con hook `useEtiquetaConfig`: lee/escribe `localStorage['etiqueta_config']`, expone `config` y `setConfig`. Config por defecto: `{ ancho_mm: 50, alto_mm: 30, campos: ['titulo', 'talle', 'color', 'codigoBarras'], modo: 'sistema' }`
- [x] 4.4 Crear `packages/front/src/hooks/use-web-serial.ts` con hook `useWebSerial`: expone `isAvailable` (detección de `navigator.serial`), `isConnected`, `connect()` (abre selector USB), `print(zpl: string)`, `disconnect()`
- [x] 4.5 Crear componente `packages/front/src/components/etiqueta/etiqueta-preview.tsx`: renderiza etiqueta con dimensiones reales × escala configurable, SVG barcode via JsBarcode, campos según config. Props: `variante`, `articuloNombre`, `config`, `escala?` (default 3)
- [x] 4.6 Crear `packages/front/src/services/etiquetas.ts` con `getVariantesParaEtiquetas(articuloIds: number[])`
- [x] 4.7 Crear `packages/front/src/hooks/etiquetas.ts` con `useGetVariantesParaEtiquetasQuery(articuloIds)`
- [x] 4.8 Actualizar `ArticuloVariante` en `packages/front/src/types/index.d.ts` con `codigoBarras?: string`

## 5. Frontend — Configuración de impresora

- [x] 5.1 Crear página `packages/front/src/app/(admin)/config/impresora-etiquetas/page.tsx`: layout 2 columnas, formulario izquierdo (ancho mm, alto mm, toggles de campos, selector de modo), preview derecho con `EtiquetaPreview` que actualiza en tiempo real
- [x] 5.2 Botón "Conectar impresora" visible solo en modo Web Serial: llama a `useWebSerial.connect()`, muestra estado de conexión
- [x] 5.3 Agregar ítem "Impresora de etiquetas" en el menú de configuración existente apuntando a `/config/impresora-etiquetas`

## 6. Frontend — Selección de artículos (flujo 2)

- [x] 6.1 Crear página `packages/front/src/app/(admin)/etiquetas/nueva/page.tsx`: tabla de artículos con multi-selección por checkbox, buscador, botón "Preparar etiquetas" habilitado cuando hay al menos uno seleccionado
- [x] 6.2 Al confirmar, navegar a `/etiquetas/preparar?articuloIds={ids}`

## 7. Frontend — Preparación de etiquetas

- [x] 7.1 Crear página `packages/front/src/app/(admin)/etiquetas/preparar/page.tsx`: lee `movimientoId` o `articuloIds` de query params para cargar variantes
- [x] 7.2 Panel izquierdo: variantes agrupadas por artículo → color, con filas de talle, cantidad con input numérico + botones [−][+], contador total de etiquetas en el footer
- [x] 7.3 Si viene de `movimientoId`: cargar variantes desde el detalle del movimiento, pre-llenar cantidades con las del movimiento
- [x] 7.4 Si viene de `articuloIds`: usar `useGetVariantesParaEtiquetasQuery`, cantidades iniciales en 1
- [x] 7.5 Panel derecho: `EtiquetaPreview` que muestra la variante sobre la que se hace hover/click; si ninguna está activa muestra la primera
- [x] 7.6 Botón "Imprimir": codifica variantes (solo con cantidad > 0) + config actual → navega a `/print/etiquetas?data={base64}` en nueva pestaña
- [x] 7.7 Advertencia si total de etiquetas supera 500

## 8. Frontend — Ruta de impresión

- [x] 8.1 Crear página `packages/front/src/app/print/etiquetas/page.tsx`: arquitectura idéntica a `/print/ventas/[id]/page.tsx`
- [x] 8.2 Decodificar query param `data` (base64 → JSON con variantes, cantidades y config)
- [x] 8.3 Modo "sistema": renderizar `{cantidad}` instancias de `EtiquetaLabel` por variante con CSS `@page { size: {ancho}mm {alto}mm; margin: 0; }` y `page-break-after: always`, `window.print()` automático al cargar
- [x] 8.4 Modo "web-serial": al montar, llamar a `useWebSerial.print(zpl)` con el ZPL generado para todas las variantes × cantidades; mostrar progreso; cerrar pestaña al finalizar

## 9. Frontend — Campo código de barras en formulario de variante

- [x] 9.1 Agregar campo `codigoBarras` (input texto, opcional) en el formulario de creación/edición de variante dentro de la página de artículo
- [x] 9.2 Mostrar texto de ayuda: "Dejá vacío para que el sistema genere uno automáticamente"

## 10. Frontend — Botón en detalle de movimiento (flujo 1)

- [x] 10.1 Agregar botón "Imprimir etiquetas" en `packages/front/src/app/(admin)/movimientos/[id]/page.tsx`, visible cuando el movimiento tiene `detalles.length > 0`
- [x] 10.2 El botón navega a `/etiquetas/preparar?movimientoId={id}`

## 11. Menú y permisos

- [x] 11.1 Agregar permiso `ETIQUETAS_IMPRIMIR` en `packages/api/src/constants/permisos.ts`
- [x] 11.2 Agregar permiso `ETIQUETAS_IMPRIMIR` en `packages/front/src/constants/permisos.ts`
- [x] 11.3 Agregar sección "Etiquetas" en el menú lateral con ítem "Nueva impresión" → `/etiquetas/nueva`
