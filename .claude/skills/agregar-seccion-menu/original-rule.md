# Agregar Sección al Menú

Guía para agregar nuevas secciones y rutas al menú lateral.

## Ubicación

**Backend:** `packages/api/src/constants/routes.ts`

El frontend consume automáticamente esta configuración.

## Template Sección con Subrutas

```typescript
// Módulo: [Nombre Módulo]
{
    title: '[Nombre Visible]',
    icon: '[NombreIconoLucide]',
    items: [
        {
            id: PERMISOS.RUTA_[MODULO],
            title: '[Nombre Ruta]',
            url: '/[ruta]',
            icon: '[NombreIconoLucide]',
        },
        {
            id: PERMISOS.RUTA_[MODULO_OTRA],
            title: '[Nombre Otra Ruta]',
            url: '/[otra-ruta]',
            icon: '[NombreIconoLucide]',
        },
    ]
},
```

## Template Ruta Simple (Sin Subrutas)

```typescript
// [Nombre Módulo]
{
    id: PERMISOS.RUTA_[MODULO],
    title: '[Nombre Visible]',
    url: '/[ruta]',
    icon: '[NombreIconoLucide]',
},
```

## Iconos Disponibles

Los iconos provienen de **Lucide React**. Iconos comunes:

| Contexto | Icono |
|----------|-------|
| Inicio | `Home` |
| Usuarios | `Users`, `User`, `UserCog` |
| Finanzas | `ChartLine`, `Wallet`, `BadgeDollarSign` |
| Inventario | `Package`, `Box` |
| Compras | `ShoppingCart` |
| Configuración | `Settings`, `Cog` |
| Flota/Vehículos | `Truck`, `Car` |
| Calendario | `Calendar`, `CalendarClock` |
| Reportes | `PieChart`, `BarChart3`, `TrendingUp` |
| Documentos | `FileText`, `File`, `Files` |
| Catálogos | `FolderCog2`, `Layers` |

**Buscar más:** [lucide.dev/icons](https://lucide.dev/icons)

## Ejemplo Completo

```typescript
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
```

## Pasos Completos

### 1. Verificar Permisos

Asegurar que existen en `packages/api/src/constants/permisos.ts`:

```typescript
// Rutas del menú - [Módulo]
RUTA_[MODULO]: 'RUTA_[MODULO]',
```

Si no existen, agregarlos también en `packages/front/src/constants/permisos.ts` (IDÉNTICOS).

### 2. Agregar Sección en routes.ts

Editar `packages/api/src/constants/routes.ts` y agregar la nueva sección en el array `MENU`:

```typescript
export const MENU = [
    // ... otras secciones

    // Módulo: Nueva Sección
    {
        title: 'Mi Nueva Sección',
        icon: 'IconoLucide',
        items: [
            {
                id: PERMISOS.RUTA_MI_MODULO,
                title: 'Mi Ruta',
                url: '/mi-ruta',
                icon: 'IconoLucide',
            },
        ]
    },

    // ... más secciones
]
```

### 3. Migración SQL (Si Hay Permisos Nuevos)

Si creaste nuevos permisos `RUTA_*`, agregar en migración SQL:

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_MI_MODULO', 'Acceso a página Mi Módulo', 'rutas');
```

## Orden Recomendado de Secciones

1. General (Inicio, Actualizaciones)
2. Módulos de Negocio (Presupuestos, Alquileres, Contratos)
3. Ventas
4. Flota
5. Catálogos
6. Compras
7. Inventario
8. Finanzas
9. Configuración del Sistema

## Estructura JSON de Rutas

```typescript
type MenuItem = {
  id?: string;           // Permiso (opcional para secciones padre)
  title: string;         // Texto visible
  url?: string;          // Ruta (opcional para secciones padre)
  icon: string;          // Nombre icono Lucide
  items?: MenuItem[];    // Subrutas (opcional)
}
```

## Frontend Automático

El frontend renderiza automáticamente el menú desde `routes.ts`:

- **Componente principal:** `NavMain` (`components/nav-main.tsx`)
- **Iconos dinámicos:** `DynamicIcon` (`components/ui/icon.tsx`)
- **Renderizado:** Automático por permiso del usuario
- **Iconos:** Lucide React cargados dinámicamente por nombre (string)

**Funcionamiento:**
```typescript
// En routes.ts (Backend)
{
  icon: 'Truck',  // String con nombre del icono
  // ...
}

// NavMain usa DynamicIcon automáticamente
<DynamicIcon name={item.icon} />  // Renderiza <Truck /> de Lucide
```

❌ **NO** se necesita modificar el frontend manualmente.
❌ **NO** se necesita importar iconos en `nav-main.tsx`.

## Anti-patrones

```typescript
// ❌ NO
icon: 'truck'  // Lowercase
icon: 'fa-truck'  // FontAwesome (no usar)
icon: '<Truck />'  // JSX
id: 'RUTA_MI_MODULO'  // String sin PERMISOS.

// ✅ SÍ
icon: 'Truck'  // PascalCase Lucide
id: PERMISOS.RUTA_MI_MODULO  // Constante
```

## Checklist

- [ ] Permisos `RUTA_*` existen en backend
- [ ] Permisos `RUTA_*` existen en frontend (idénticos)
- [ ] Sección agregada en `routes.ts`
- [ ] Icono válido de Lucide (PascalCase)
- [ ] `id` usa constantes de `PERMISOS`
- [ ] URLs con `/` inicial
- [ ] Migración SQL si hay permisos nuevos
- [ ] NO asignar permisos a roles en migración

## Resumen

| Aspecto | Valor |
|---------|-------|
| Ubicación | `packages/api/src/constants/routes.ts` |
| Iconos | Lucide React (PascalCase) |
| Frontend | Automático (no modificar) |
| Permisos | Backend + Frontend idénticos |
| SQL | Solo INSERT permissions (no roles) |
