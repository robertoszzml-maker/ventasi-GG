# Diagrama de Tablas — Sistema Stock Artículos

## Modelo completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLASIFICACIÓN JERÁRQUICA                             │
├──────────────┐    ┌──────────────────┐    ┌──────────────────────────────┐  │
│   familia    │    │      grupo       │    │          subgrupo            │  │
├──────────────┤    ├──────────────────┤    ├──────────────────────────────┤  │
│ id (PK)      │◄───│ id (PK)          │◄───│ id (PK)                      │  │
│ nombre       │    │ familia_id (FK)  │    │ grupo_id (FK)                │  │
│ activo       │    │ nombre           │    │ nombre                       │  │
└──────────────┘    │ activo           │    │ activo                       │  │
                    └──────────────────┘    └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         COLORES Y PALETAS                                   │
├────────────────────┐    ┌────────────────────┐    ┌───────────────────────┐ │
│       color        │    │   paleta_color     │    │  paleta_color_detalle │ │
├────────────────────┤    ├────────────────────┤    ├───────────────────────┤ │
│ id (PK)            │◄───│ id (PK)            │◄───│ id (PK)               │ │
│ codigo (UNIQUE)    │    │ nombre             │    │ paleta_id (FK)        │ │
│ nombre             │    │ descripcion        │    │ color_id (FK) ────────┤►│
│ descripcion        │    │ activo             │    │ orden                 │ │
│ hex (nullable)     │    └────────────────────┘    │ UNIQUE(paleta,color)  │ │
│ activo             │                              └───────────────────────┘ │
└────────────────────┘                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          TALLES Y CURVAS                                    │
├────────────────────┐    ┌────────────────────┐    ┌───────────────────────┐ │
│       talle        │    │    curva_talle     │    │  curva_talle_detalle  │ │
├────────────────────┤    ├────────────────────┤    ├───────────────────────┤ │
│ id (PK)            │◄───│ id (PK)            │◄───│ id (PK)               │ │
│ codigo (UNIQUE)    │    │ nombre             │    │ curva_id (FK)         │ │
│ nombre             │    │ descripcion        │    │ talle_id (FK) ────────┤►│
│ orden              │    │ activo             │    │ orden                 │ │
│ activo             │    └────────────────────┘    │ UNIQUE(curva,talle)   │ │
└────────────────────┘                              └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARTÍCULO (objeto comercial)                          │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           articulo                                   │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │ id (PK)                                                              │   │
│  │ subgrupo_id (FK) ──────────────────────────────────► subgrupo       │   │
│  │ nombre                                                               │   │
│  │ descripcion                                                          │   │
│  │ codigo (UNIQUE)          ← código interno del negocio               │   │
│  │ sku (UNIQUE)                                                         │   │
│  │ codigo_barras            ← identifica artículo (no variante)        │   │
│  │ codigo_qr                                                            │   │
│  │ precio DECIMAL(15,2)     ← compartido por todas las variantes       │   │
│  │ paleta_id (FK, SET NULL) ──────────────────────────► paleta_color   │   │
│  │ curva_id  (FK, SET NULL) ──────────────────────────► curva_talle    │   │
│  │ activo                                                               │   │
│  │ created_at                                                           │   │
│  │ updated_at                                                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                          │                                        │
│         ▼                          ▼                                        │
│  ┌─────────────────┐     ┌──────────────────┐                              │
│  │ articulo_talle  │     │  articulo_color  │                              │
│  ├─────────────────┤     ├──────────────────┤                              │
│  │ id (PK)         │     │ id (PK)          │                              │
│  │ articulo_id(FK) │     │ articulo_id (FK) │                              │
│  │ talle_id (FK)──►│talle│ color_id (FK)───►│color                        │
│  │ orden           │     │ orden            │                              │
│  │ UNIQUE(art,tal) │     │ UNIQUE(art,col)  │                              │
│  └─────────────────┘     └──────────────────┘                              │
│   fuente de verdad          fuente de verdad                               │
│   de talles del art.        de colores del art.                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    VARIANTES (objeto logístico / stock)                     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                       articulo_variante                              │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │ id (PK)                                                              │   │
│  │ articulo_id (FK) ─────────────────────────────────► articulo        │   │
│  │ talle_id (FK)    ─────────────────────────────────► talle           │   │
│  │ color_id (FK)    ─────────────────────────────────► color           │   │
│  │ cantidad INT DEFAULT 0  ← stock de esta variante                    │   │
│  │ activo                                                               │   │
│  │ UNIQUE (articulo_id, talle_id, color_id)                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  IMPORTANTE: solo existe cuando hubo un ingreso de mercadería              │
│  stock_total del artículo = SUM(cantidad) WHERE activo = 1                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Relaciones resumidas

```
familia (1) ──────────── (N) grupo
grupo   (1) ──────────── (N) subgrupo
subgrupo(1) ──────────── (N) articulo

paleta_color     (1) ── (N) paleta_color_detalle ── (N) color
curva_talle      (1) ── (N) curva_talle_detalle  ── (N) talle

articulo (1) ── (N) articulo_talle ── talle    [copia de curva al crear]
articulo (1) ── (N) articulo_color ── color    [copia de paleta al crear]
articulo (1) ── (N) articulo_variante          [creación lazy en ingresos]

articulo_variante → talle  (FK)
articulo_variante → color  (FK)
articulo          → paleta_color (FK, SET NULL)  [referencia histórica]
articulo          → curva_talle  (FK, SET NULL)  [referencia histórica]
```

## Flujo de generación de variantes

```
CREAR ARTÍCULO
     │
     ├─► INSERT articulo
     ├─► INSERT articulo_talle ← FROM curva_talle_detalle WHERE curva_id = :curvaId
     ├─► INSERT articulo_color ← FROM paleta_color_detalle WHERE paleta_id = :paletaId
     └─► (NO se crean variantes)

INGRESO DE MERCADERÍA (futuro)
     │
     └─► Por cada celda con cantidad > 0:
         INSERT INTO articulo_variante (articulo_id, talle_id, color_id, cantidad)
         ON DUPLICATE KEY UPDATE cantidad = cantidad + :nuevaCantidad
```
