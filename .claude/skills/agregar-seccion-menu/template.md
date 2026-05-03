# Templates: Agregar Sección al Menú

## Template 1: Sección con Subrutas

### Permisos (Backend + Frontend)

```typescript
// packages/api/src/constants/permisos.ts
// packages/front/src/constants/permisos.ts (IDÉNTICO)

// Rutas del menú - [Módulo]
RUTA_[MODULO]: 'RUTA_[MODULO]',
RUTA_[MODULO]_[SUBMODULO]: 'RUTA_[MODULO]_[SUBMODULO]',
```

### routes.ts

```typescript
// packages/api/src/constants/routes.ts

// Módulo: [Nombre Módulo]
{
    title: '[Nombre Visible]',
    icon: '[IconoLucide]',
    items: [
        {
            id: PERMISOS.RUTA_[MODULO],
            title: '[Nombre Ruta]',
            url: '/[ruta]',
            icon: '[IconoLucide]',
        },
        {
            id: PERMISOS.RUTA_[MODULO]_[SUBMODULO],
            title: '[Nombre Subruta]',
            url: '/[ruta]/[subruta]',
            icon: '[IconoLucide]',
        },
    ]
},
```

### Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_[MODULO]', 'Acceso a [descripción]', 'rutas'),
('RUTA_[MODULO]_[SUBMODULO]', 'Acceso a [descripción]', 'rutas');
```

---

## Template 2: Ruta Simple (Sin Subrutas)

### Permisos (Backend + Frontend)

```typescript
// packages/api/src/constants/permisos.ts
// packages/front/src/constants/permisos.ts (IDÉNTICO)

RUTA_[MODULO]: 'RUTA_[MODULO]',
```

### routes.ts

```typescript
// packages/api/src/constants/routes.ts

// [Nombre Módulo]
{
    id: PERMISOS.RUTA_[MODULO],
    title: '[Nombre Visible]',
    url: '/[ruta]',
    icon: '[IconoLucide]',
},
```

### Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_[MODULO]', 'Acceso a [descripción]', 'rutas');
```

---

## Ejemplo Completo: Flota

### 1. Permisos

**Backend** (`packages/api/src/constants/permisos.ts`):
```typescript
// Rutas del menú - Flota
RUTA_EQUIPAMIENTO: 'RUTA_EQUIPAMIENTO',
RUTA_EQUIPAMIENTO_TIPO: 'RUTA_EQUIPAMIENTO_TIPO',
```

**Frontend** (`packages/front/src/constants/permisos.ts`):
```typescript
// IDÉNTICO
RUTA_EQUIPAMIENTO: 'RUTA_EQUIPAMIENTO',
RUTA_EQUIPAMIENTO_TIPO: 'RUTA_EQUIPAMIENTO_TIPO',
```

### 2. routes.ts

```typescript
// packages/api/src/constants/routes.ts

export const MENU = [
    // ... otras secciones

    // Módulo: Flota
    {
        title: 'Flota',
        icon: 'Truck',
        items: [
            {
                id: PERMISOS.RUTA_EQUIPAMIENTO,
                title: 'Equipamiento',
                url: '/equipamiento',
                icon: 'Truck',
            },
            {
                id: PERMISOS.RUTA_EQUIPAMIENTO_TIPO,
                title: 'Tipos de Equipamiento',
                url: '/equipamiento-tipo',
                icon: 'Tags',
            },
        ]
    },

    // ... más secciones
]
```

### 3. Migración SQL

```sql
-- Migración: agregar-seccion-flota.sql

INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_EQUIPAMIENTO', 'Acceso a página Equipamiento', 'rutas'),
('RUTA_EQUIPAMIENTO_TIPO', 'Acceso a página Tipos de Equipamiento', 'rutas');
```

---

## Ejemplo Completo: Inicio (Ruta Simple)

### 1. Permisos

```typescript
// Backend + Frontend
RUTA_INICIO: 'RUTA_INICIO',
```

### 2. routes.ts

```typescript
export const MENU = [
    // Inicio
    {
        id: PERMISOS.RUTA_INICIO,
        title: 'Inicio',
        url: '/inicio',
        icon: 'Home',
    },

    // ... otras secciones
]
```

### 3. Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_INICIO', 'Acceso a página de inicio', 'rutas');
```

---

## Iconos Comunes (Copiar y Pegar)

```typescript
// Generales
icon: 'Home'           // Inicio
icon: 'Settings'       // Configuración
icon: 'Users'          // Usuarios
icon: 'User'           // Usuario individual
icon: 'UserCog'        // Configuración usuarios

// Finanzas
icon: 'ChartLine'      // Gráficos financieros
icon: 'Wallet'         // Billetera
icon: 'BadgeDollarSign' // Dinero

// Inventario y Compras
icon: 'Package'        // Paquete
icon: 'Box'            // Caja
icon: 'ShoppingCart'   // Carrito

// Flota
icon: 'Truck'          // Camión
icon: 'Car'            // Auto

// Documentos
icon: 'FileText'       // Documento texto
icon: 'File'           // Archivo general
icon: 'Files'          // Múltiples archivos

// Reportes
icon: 'PieChart'       // Gráfico circular
icon: 'BarChart3'      // Gráfico barras
icon: 'TrendingUp'     // Tendencia

// Catálogos
icon: 'FolderCog2'     // Carpeta configuración
icon: 'Layers'         // Capas
icon: 'Tags'           // Etiquetas

// Calendario
icon: 'Calendar'       // Calendario
icon: 'CalendarClock'  // Calendario con hora
```

**Buscar más:** [lucide.dev/icons](https://lucide.dev/icons)

---

## Checklist de Validación

Antes de confirmar:

### Permisos:
- [ ] Permisos creados en `packages/api/src/constants/permisos.ts`
- [ ] Permisos creados en `packages/front/src/constants/permisos.ts`
- [ ] Backend y Frontend tienen permisos IDÉNTICOS
- [ ] Formato: `RUTA_[MODULO]: 'RUTA_[MODULO]'`

### routes.ts:
- [ ] Sección agregada en `packages/api/src/constants/routes.ts`
- [ ] Icono en PascalCase (ej: `Truck` no `truck`)
- [ ] URLs con `/` inicial (ej: `/equipamiento`)
- [ ] `id` usa constante `PERMISOS.RUTA_[MODULO]`
- [ ] Estructura correcta (con/sin items según caso)

### Migración SQL:
- [ ] Archivo de migración creado
- [ ] INSERT INTO permissions con nuevos permisos
- [ ] `modulo` es `'rutas'`
- [ ] NO hay INSERT INTO role_permissions

### Frontend:
- [ ] NO se modificó `nav-main.tsx`
- [ ] NO se importaron iconos manualmente

---

## Anti-patrones a Evitar

```typescript
// ❌ NO hacer:

// Icono en lowercase
icon: 'truck'

// FontAwesome
icon: 'fa-truck'

// JSX
icon: '<Truck />'

// String sin constante
id: 'RUTA_EQUIPAMIENTO'

// URL sin slash
url: 'equipamiento'

// Permisos solo en un lado
// (backend o frontend, falta el otro)

// Asignar roles en migración
INSERT INTO role_permissions ...

// ✅ SÍ hacer:

// Icono PascalCase Lucide
icon: 'Truck'

// Constante de permisos
id: PERMISOS.RUTA_EQUIPAMIENTO

// URL con slash
url: '/equipamiento'

// Permisos en ambos lados
// Backend Y Frontend (idénticos)

// Solo INSERT permissions
INSERT INTO permissions ...
```
