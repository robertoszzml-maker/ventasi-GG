# Ejemplos: Agregar Sección al Menú

## Ejemplo 1: Sección con Subrutas (Flota)

### Paso 1: Verificar Permisos

**Backend** (`packages/api/src/constants/permisos.ts`):
```typescript
// Rutas del menú - Flota
RUTA_EQUIPAMIENTO: 'RUTA_EQUIPAMIENTO',
RUTA_EQUIPAMIENTO_TIPO: 'RUTA_EQUIPAMIENTO_TIPO',
```

**Frontend** (`packages/front/src/constants/permisos.ts`):
```typescript
// IDÉNTICO al backend
RUTA_EQUIPAMIENTO: 'RUTA_EQUIPAMIENTO',
RUTA_EQUIPAMIENTO_TIPO: 'RUTA_EQUIPAMIENTO_TIPO',
```

### Paso 2: Agregar en routes.ts

**Ubicación:** `packages/api/src/constants/routes.ts`

```typescript
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

### Paso 3: Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_EQUIPAMIENTO', 'Acceso a página Equipamiento', 'rutas'),
('RUTA_EQUIPAMIENTO_TIPO', 'Acceso a página Tipos de Equipamiento', 'rutas');
```

---

## Ejemplo 2: Ruta Simple (Inicio)

### Paso 1: Verificar Permisos

**Backend** (`packages/api/src/constants/permisos.ts`):
```typescript
RUTA_INICIO: 'RUTA_INICIO',
```

**Frontend** (`packages/front/src/constants/permisos.ts`):
```typescript
RUTA_INICIO: 'RUTA_INICIO',
```

### Paso 2: Agregar en routes.ts

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

### Paso 3: Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_INICIO', 'Acceso a página de inicio', 'rutas');
```

---

## Ejemplo 3: Sección de Catálogos (Múltiples Subrutas)

### Paso 1: Verificar Permisos

```typescript
// Backend y Frontend
RUTA_CUENTAS_CONTABLES: 'RUTA_CUENTAS_CONTABLES',
RUTA_PROVEEDORES: 'RUTA_PROVEEDORES',
RUTA_CLIENTES: 'RUTA_CLIENTES',
```

### Paso 2: Agregar en routes.ts

```typescript
// Módulo: Catálogos
{
    title: 'Catálogos',
    icon: 'FolderCog2',
    items: [
        {
            id: PERMISOS.RUTA_CUENTAS_CONTABLES,
            title: 'Cuentas Contables',
            url: '/cuentas-contables',
            icon: 'Calculator',
        },
        {
            id: PERMISOS.RUTA_PROVEEDORES,
            title: 'Proveedores',
            url: '/proveedores',
            icon: 'Users',
        },
        {
            id: PERMISOS.RUTA_CLIENTES,
            title: 'Clientes',
            url: '/clientes',
            icon: 'UserCheck',
        },
    ]
},
```

### Paso 3: Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_CUENTAS_CONTABLES', 'Acceso a Cuentas Contables', 'rutas'),
('RUTA_PROVEEDORES', 'Acceso a Proveedores', 'rutas'),
('RUTA_CLIENTES', 'Acceso a Clientes', 'rutas');
```

---

## Errores Comunes vs Soluciones

### ❌ Icono en minúsculas

```typescript
// ❌ INCORRECTO
icon: 'truck'

// ✅ CORRECTO
icon: 'Truck'
```

### ❌ Usar FontAwesome

```typescript
// ❌ INCORRECTO
icon: 'fa-truck'

// ✅ CORRECTO
icon: 'Truck'  // Lucide React
```

### ❌ String literal sin constante

```typescript
// ❌ INCORRECTO
id: 'RUTA_EQUIPAMIENTO'

// ✅ CORRECTO
id: PERMISOS.RUTA_EQUIPAMIENTO
```

### ❌ URL sin slash inicial

```typescript
// ❌ INCORRECTO
url: 'equipamiento'

// ✅ CORRECTO
url: '/equipamiento'
```

### ❌ Permisos solo en backend

```typescript
// ❌ INCORRECTO
// Solo en packages/api/src/constants/permisos.ts

// ✅ CORRECTO
// En backend Y frontend (idénticos)
```

### ❌ Asignar permisos a roles en migración

```sql
-- ❌ INCORRECTO
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_EQUIPAMIENTO', 'Acceso a Equipamiento', 'rutas');

INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, LAST_INSERT_ID());

-- ✅ CORRECTO (solo permissions)
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_EQUIPAMIENTO', 'Acceso a Equipamiento', 'rutas');
```

---

## Flujo Completo: Agregar "Reportes"

### 1. Crear permisos

**Backend** (`packages/api/src/constants/permisos.ts`):
```typescript
RUTA_REPORTES: 'RUTA_REPORTES',
RUTA_REPORTE_VENTAS: 'RUTA_REPORTE_VENTAS',
RUTA_REPORTE_COMPRAS: 'RUTA_REPORTE_COMPRAS',
```

**Frontend** (`packages/front/src/constants/permisos.ts`):
```typescript
// IDÉNTICO
RUTA_REPORTES: 'RUTA_REPORTES',
RUTA_REPORTE_VENTAS: 'RUTA_REPORTE_VENTAS',
RUTA_REPORTE_COMPRAS: 'RUTA_REPORTE_COMPRAS',
```

### 2. Editar routes.ts

```typescript
// Módulo: Reportes
{
    title: 'Reportes',
    icon: 'PieChart',
    items: [
        {
            id: PERMISOS.RUTA_REPORTE_VENTAS,
            title: 'Ventas',
            url: '/reportes/ventas',
            icon: 'TrendingUp',
        },
        {
            id: PERMISOS.RUTA_REPORTE_COMPRAS,
            title: 'Compras',
            url: '/reportes/compras',
            icon: 'ShoppingCart',
        },
    ]
},
```

### 3. Crear migración

```sql
-- Migración: agregar-seccion-reportes.sql

INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_REPORTES', 'Acceso a sección de reportes', 'rutas'),
('RUTA_REPORTE_VENTAS', 'Acceso a reporte de ventas', 'rutas'),
('RUTA_REPORTE_COMPRAS', 'Acceso a reporte de compras', 'rutas');
```

### 4. Resultado

El menú mostrará automáticamente:

```
📊 Reportes
   📈 Ventas
   🛒 Compras
```

---

## Orden Recomendado de Secciones

```typescript
export const MENU = [
    // 1. General
    { /* Inicio */ },

    // 2. Módulos de Negocio
    { /* Presupuestos */ },
    { /* Alquileres */ },
    { /* Contratos */ },

    // 3. Ventas
    { /* Ventas */ },

    // 4. Flota
    { /* Equipamiento */ },

    // 5. Catálogos
    { /* Proveedores, Clientes */ },

    // 6. Compras
    { /* Compras */ },

    // 7. Inventario
    { /* Inventario */ },

    // 8. Finanzas
    { /* Cuentas, Bancos */ },

    // 9. Reportes
    { /* Reportes */ },

    // 10. Configuración
    { /* Configuración */ },
]
```

---

## Tips

1. **Iconos consistentes:** Usar el mismo icono para módulos relacionados
2. **Nombres cortos:** Títulos concisos (máx 20 caracteres)
3. **URLs descriptivas:** Usar kebab-case `/mi-modulo`
4. **Permisos explícitos:** Cada ruta necesita su permiso
5. **Frontend automático:** NO modificar `nav-main.tsx`
