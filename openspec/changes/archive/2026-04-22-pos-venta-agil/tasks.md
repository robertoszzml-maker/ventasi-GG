## 1. Header POS: Chips de vendedor + autocomplete de cliente

- [x] 1.1 Crear componente `PosHeader` con chips de vendedor activos (reemplaza `VentaCabecera`)
- [x] 1.2 Implementar autocomplete de cliente con búsqueda por nombre/CUIT en el header
- [x] 1.3 Implementar badge colapsado de tipo de comprobante con auto-sugerencia por condición IVA del cliente
- [x] 1.4 Implementar apertura del selector de comprobante al hacer click en el badge
- [x] 1.5 Auto-cargar lista de precios por defecto (`esDefault = 1`) al montar la pantalla

## 2. Panel izquierdo: Búsqueda de artículos + grilla inline

- [x] 2.1 Crear componente `PosArticuloBusqueda` con campo de búsqueda siempre visible y autofocus
- [x] 2.2 Mostrar lista de resultados al buscar (≥2 caracteres), con nombre y precio
- [x] 2.3 Crear componente `PosGrillaVariantes` que muestra la grilla talle×color con stock en cada celda
- [x] 2.4 Al hacer click en un artículo de la lista, mostrar la grilla inline reemplazando los resultados
- [x] 2.5 Al hacer click en una celda con stock > 0, agregar variante al carrito con cantidad=1 y volver a búsqueda
- [x] 2.6 Deshabilitar visualmente celdas con stock = 0 (no clickeables)
- [x] 2.7 Para artículos con única variante (sin talle/color), agregar directo al carrito sin mostrar grilla
- [x] 2.8 Botón "← Volver" en la grilla para regresar a la búsqueda sin agregar nada

## 3. Panel derecho: Carrito simplificado

- [x] 3.1 Crear componente `PosCarrito` que lista los artículos agregados
- [x] 3.2 Cada línea muestra: nombre, variante (talle/color), [−] cantidad [+], precio unitario, subtotal, [✕]
- [x] 3.3 Botones [−] y [+] modifican cantidad y recalculan subtotal y total en tiempo real
- [x] 3.4 Botón "%" en cada línea expande inputs inline de descuento (porcentaje o monto) sin abrir modal
- [x] 3.5 Al ingresar descuento %, limpiar campo de descuento $, y viceversa
- [x] 3.6 Botón [✕] elimina la línea y recalcula totales
- [x] 3.7 Mostrar total grande y visible siempre en el panel derecho

## 4. Panel derecho: Pago rápido por pills

- [x] 4.1 Crear componente `PosPago` con pills de métodos de pago activos
- [x] 4.2 Click en pill agrega un pago con el saldo restante pre-llenado
- [x] 4.3 Mostrar indicador "Saldo cubierto" cuando la suma de pagos iguala el total
- [x] 4.4 Botón "+" para agregar pago adicional con otro método (pago dividido)
- [x] 4.5 Permitir eliminar un pago ya agregado

## 5. Botón COBRAR y confirmación

- [x] 5.1 Mostrar botón "COBRAR $XX.XXX" prominente en la base del panel derecho
- [x] 5.2 Deshabilitar COBRAR cuando falte vendedor, cliente, artículos o saldo no cubierto
- [x] 5.3 Mostrar texto de ayuda indicando qué requisito falta cuando COBRAR está deshabilitado
- [x] 5.4 Al presionar COBRAR, llamar a la API de creación de venta con estado confirmado
- [x] 5.5 Mostrar confirmación visual de venta exitosa en la misma pantalla (toast + reset del formulario)
- [x] 5.6 Al confirmar exitosamente, limpiar el formulario para comenzar una nueva venta sin navegar

## 6. Integración y reemplazo de componentes legacy

- [x] 6.1 Reemplazar el contenido de `packages/front/src/app/(admin)/ventas/nueva/page.tsx` con el nuevo layout POS
- [x] 6.2 Eliminar el uso de `VentaAgregarArticulo` (dialog eliminado)
- [x] 6.3 Eliminar el uso de `VentaDetalleTabla` (reemplazado por `PosCarrito`)
- [x] 6.4 Eliminar el uso de `VentaFormasPago` (reemplazado por `PosPago`)
- [x] 6.5 Integrar `VentaTotalizador` (cálculos) como lógica interna del carrito — mantener función `calcularTotales`
- [x] 6.6 Verificar que el descuento/recargo global sigue funcionando (colapsado en panel de totales del carrito)
