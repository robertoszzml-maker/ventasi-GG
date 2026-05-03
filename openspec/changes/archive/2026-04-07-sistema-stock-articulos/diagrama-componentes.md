# Diagrama de Componentes Frontend

## Arquitectura por capas

```
packages/front/src/
├── services/                     ← llamadas HTTP con fetchClient
│   ├── familia.service.ts
│   ├── grupo.service.ts
│   ├── subgrupo.service.ts
│   ├── color.service.ts
│   ├── paleta-color.service.ts
│   ├── talle.service.ts
│   ├── curva-talle.service.ts
│   ├── articulo.service.ts
│   └── articulo-variante.service.ts
│
├── hooks/                        ← TanStack Query (estado servidor)
│   ├── useFamilias.ts
│   ├── useGrupos.ts
│   ├── useSubgrupos.ts
│   ├── useColores.ts
│   ├── usePaletas.ts
│   ├── useTalles.ts
│   ├── useCurvas.ts
│   ├── useArticulos.ts
│   └── useArticuloVariantes.ts
│
└── app/(sistema)/stock/          ← páginas Next.js App Router
    ├── articulos/
    │   ├── page.tsx              ← lista artículos
    │   ├── nuevo/page.tsx        ← crear artículo
    │   └── [id]/page.tsx         ← detalle + grilla
    └── maestros/
        ├── familias/page.tsx
        ├── grupos/page.tsx
        ├── subgrupos/page.tsx
        ├── colores/page.tsx
        ├── paletas/page.tsx
        ├── talles/page.tsx
        └── curvas/page.tsx
```

## Árbol de componentes

### Página lista de artículos

```
ArticulosPage (page.tsx)
└── ArticulosTable
    ├── TanStack Table (servidor)
    │   ├── col: nombre
    │   ├── col: SKU
    │   ├── col: precio
    │   ├── col: subgrupo (familia > grupo > subgrupo)
    │   ├── col: variantes reales (badge contador)
    │   └── col: stock total (badge número)
    └── AccionesArticulo
        ├── BtnVerDetalle
        └── BtnDesactivar
```

### Página crear artículo

```
NuevoArticuloPage (nuevo/page.tsx)
└── ArticuloForm (react-hook-form + Zod)
    ├── CamposBasicos
    │   ├── Input: nombre
    │   ├── Input: codigo
    │   ├── Input: sku
    │   ├── Input: codigo_barras
    │   ├── Input: codigo_qr
    │   └── Input: precio (monetario)
    ├── SelectorClasificacion
    │   ├── SelectorFamilia (autocomplete)
    │   ├── SelectorGrupo   (autocomplete, filtrado por familia)
    │   └── SelectorSubgrupo (autocomplete, filtrado por grupo)
    ├── SelectorCurva (autocomplete, obligatorio)
    │   └── PreviewCurva: muestra talles de la curva seleccionada
    └── SelectorPaleta (autocomplete, obligatorio)
        └── PreviewPaleta: muestra colores de la paleta seleccionada
```

### Página detalle de artículo

```
ArticuloDetallePage ([id]/page.tsx)
├── ArticuloHeader
│   ├── DatosComerciales (nombre, sku, precio, barcode, qr)
│   ├── Clasificacion (familia > grupo > subgrupo)
│   └── AccionesArticulo (editar, desactivar)
├── GrillaVariantes                          ← componente central
│   ├── ToolbarGrilla
│   │   ├── BtnAgregarTalle
│   │   ├── BtnAgregarColor
│   │   └── BtnIngresarMercaderia
│   ├── TablaGrilla
│   │   ├── HeaderRow: [talle \ color_1] [color_2] [color_3] ...
│   │   └── DataRow (por cada talle):
│   │       └── CeldaVariante (por cada color)
│   │           ├── estado = 'potencial' → celda gris, cantidad "—"
│   │           ├── estado = 'real'      → celda activa, cantidad editable
│   │           └── estado = 'desactivada' → celda tachada
│   └── FilaExtra (variantes real-extra fuera de curva/paleta)
└── ResumenStock
    └── StockTotalBadge: "Stock total: N unidades"
```

### Componente GrillaVariantes (detalle)

```
GrillaVariantes
│
├── props: articuloId
├── data: useArticuloVariantes(articuloId)  ← GET /articulos/:id/grilla
│
├── estructura visual:
│
│        | Rojo  | Azul  | Verde |
│   ─────┼───────┼───────┼───────┤
│   S    |  12   |  --   |  --   |
│   M    |   8   |   3   |  --   |
│   L    |   0   |  11   |  --   |
│   XL*  |  --   |  --   |  --   |
│
│   potencial: celda con fondo gris, "—"
│   real:      celda con fondo blanco, número clickeable
│   real-extra: fila/col marcada con (*) indicador
│
└── acciones por celda:
    ├── click en celda real → modal AjusteStock
    └── click en celda potencial → modal IngresarCantidad
```

### Maestros (patrón CRUD uniforme)

```
MaestroCRUD (patrón aplicado a todos los maestros)
├── ListaPage
│   ├── TanStack Table (paginación servidor)
│   │   ├── cols: específicas del maestro
│   │   └── col: acciones (editar, desactivar)
│   └── BtnNuevo → abre FormularioMaestro
└── FormularioMaestro (modal o página)
    ├── react-hook-form + Zod
    └── campos según maestro:
        ├── ColorForm: codigo, nombre, descripcion, hex (color picker opcional)
        ├── PaletaForm: nombre + MultiSelectorColores con drag-order
        ├── TalleForm: codigo, nombre, orden
        └── CurvaForm: nombre + MultiSelectorTalles con drag-order
```

## Flujo de datos principales

```
LISTA DE ARTÍCULOS
useArticulos() → GET /articulos?page=1&limit=20
     │
     ▼
ArticulosTable (muestra artículo base, no variantes)
     │ click fila
     ▼
ArticuloDetallePage

DETALLE CON GRILLA
useArticuloVariantes(id) → GET /articulos/:id/grilla
     │
     ▼ retorna:
     [
       { talle: 'S', color: 'Rojo', cantidad: 12, estado: 'real' },
       { talle: 'S', color: 'Azul', cantidad: null, estado: 'potencial' },
       ...
     ]
     │
     ▼
GrillaVariantes construye matriz talle × color y renderiza celdas

CREAR ARTÍCULO
ArticuloForm → POST /articulos
     backend: crea articulo
            + copia curva → articulo_talle
            + copia paleta → articulo_color
            (sin variantes)
     │
     ▼
redirect → ArticuloDetallePage (grilla vacía, todo potencial)

INGRESO MERCADERÍA (futuro)
GrillaVariantes → BtnIngresarMercaderia
     │
     ▼
ModalIngreso: grilla editable con cantidades
     │ submit
     ▼
POST /articulos/:id/ingresos
     backend: INSERT/UPDATE articulo_variante
     │
     ▼
invalidateQuery → useArticuloVariantes → re-render grilla
```

## Módulos backend (NestJS)

```
packages/api/src/modules/
│
├── clasificacion/
│   ├── familia/
│   │   ├── familia.entity.ts
│   │   ├── familia.service.ts
│   │   ├── familia.controller.ts
│   │   └── familia.module.ts
│   ├── grupo/
│   └── subgrupo/
│
├── color/
│   ├── color/
│   │   ├── color.entity.ts
│   │   ├── color.service.ts
│   │   ├── color.controller.ts
│   │   └── color.module.ts
│   └── paleta-color/
│       ├── paleta-color.entity.ts
│       ├── paleta-color-detalle.entity.ts
│       ├── paleta-color.service.ts
│       ├── paleta-color.controller.ts
│       └── paleta-color.module.ts
│
├── talle/
│   ├── talle/
│   └── curva-talle/
│       ├── curva-talle.entity.ts
│       ├── curva-talle-detalle.entity.ts
│       └── ...
│
└── articulo/
    ├── articulo/
    │   ├── articulo.entity.ts
    │   ├── articulo-talle.entity.ts
    │   ├── articulo-color.entity.ts
    │   ├── articulo.service.ts      ← lógica de copia curva/paleta al crear
    │   ├── articulo.controller.ts
    │   └── articulo.module.ts
    └── articulo-variante/
        ├── articulo-variante.entity.ts
        ├── articulo-variante.service.ts  ← creación lazy + grilla
        ├── articulo-variante.controller.ts
        └── articulo-variante.module.ts
```
