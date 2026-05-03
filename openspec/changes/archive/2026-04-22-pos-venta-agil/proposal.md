## Why

La pantalla de nueva venta está diseñada como backoffice contable, no como punto de venta. Cada artículo requiere 8+ clicks dentro de un dialog, y 4 campos obligatorios bloquean la carga antes de poder empezar. Con filas de 10+ clientes y vendedoras sin experiencia técnica, esto genera cuellos de botella críticos en el momento de la venta.

## What Changes

- **REEMPLAZAR** la pantalla `/ventas/nueva` por un layout POS de 2 columnas estático, todo en una sola pantalla sin navegación
- **ELIMINAR** el dialog de agregar artículos (`VentaAgregarArticulo`) — la grilla de talles/colores aparece inline en el panel izquierdo
- **REEMPLAZAR** los 4 selects de cabecera por chips de vendedor (1 click) + autocomplete de cliente + badge de comprobante colapsado y auto-sugerido
- **REEMPLAZAR** la tabla de detalle con columnas Desc%/Desc$ siempre visibles por una lista de carrito con controles [−][+] y descuento opcional colapsado por línea
- **REEMPLAZAR** el formulario de formas de pago por pills de método rápido (Efectivo / Débito / Crédito / Transferencia) que pre-llenan el monto
- **REEMPLAZAR** "Guardar como borrador" por un único botón **COBRAR** que confirma y guarda directamente
- **ELIMINAR** la navegación post-venta a pantalla separada de confirmación

## Capabilities

### New Capabilities

- `pos-venta-agil`: Pantalla POS de 2 columnas con flujo de venta de mínima fricción (7-8 clicks para venta completa)

### Modified Capabilities

- `pantalla-venta`: Los requisitos de UX/flujo cambian significativamente — grilla inline en lugar de dialog, chips de vendedor en lugar de select, comprobante auto-colapsado, carrito simplificado, un solo botón de acción final

## Impact

- `packages/front/src/app/(admin)/ventas/nueva/page.tsx` — reescritura completa
- `packages/front/src/components/venta/venta-cabecera.tsx` — reemplazado por header POS
- `packages/front/src/components/venta/venta-agregar-articulo.tsx` — eliminado
- `packages/front/src/components/venta/venta-detalle-tabla.tsx` — reemplazado por carrito simplificado
- `packages/front/src/components/venta/venta-formas-pago.tsx` — reemplazado por pills de pago rápido
- `packages/front/src/components/venta/venta-totalizador.tsx` — integrado en sidebar del carrito
- Sin cambios en backend ni en base de datos — la API existente se reutiliza
