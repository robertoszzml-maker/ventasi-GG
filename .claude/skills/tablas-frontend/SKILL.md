---
name: tablas-frontend
description: Crear tablas TanStack con paginación, filtrado y ordenamiento del lado del servidor
license: MIT
---

# Tablas Frontend (TanStack Table)

Crear tablas con TanStack Table siguiendo el patrón estándar del proyecto.

## Input

- `<entidad>`: Nombre de la entidad (ej: `equipamiento`, `proveedor`)

**Ejemplo:** `/tablas-frontend equipamiento`

## Steps

1. **Crear Estructura de Carpeta**
   - Crear `components/tables/[entidad]-table/`
   - Archivos: `index.tsx` + `columns.tsx`

2. **Crear index.tsx**
   - Template completo con estados TanStack
   - Hook `useGet[Entidades]Query` con parámetros
   - Configuración `useReactTable` con flags manuales
   - Skeleton mientras carga

3. **Crear columns.tsx**
   - Definir columnas con `accessorFn`, `id`, `accessorKey`
   - Links a página de detalle
   - Envolver celdas en `<CellColumn>`

4. **Validar Dependencias**
   - Hook implementado en `hooks/[entidad].tsx`
   - Servicio en `services/[entidad].ts`

## Output

**Estructura creada:**
```
components/tables/[entidad]-table/
├── index.tsx      # Componente principal con TanStack config
└── columns.tsx    # Definición de columnas
```

**index.tsx:**
```typescript
"use client";
// Estados: sorting, globalFilter, columnFilters, pagination
// Hook: useGet[Entidades]Query({ pagination, columnFilters, sorting, globalFilter })
// useReactTable con manualPagination, manualFiltering, manualSorting
// Return: <DataTable table={table} columns={columns} />
```

**columns.tsx:**
```typescript
// Columnas con accessorFn, id, accessorKey
// Links a /[ruta]/:id
// <CellColumn> wrapper
```

## Recursos

- [📖 Referencia](reference.md) - Patrones TanStack completos
- [💡 Ejemplos](examples.md) - EquipamientoTipoTable completo
- [📋 Template](template.md) - Código base para copiar

## Flags Críticos

| Flag | Valor | Descripción |
|------|-------|-------------|
| `manualPagination` | `true` | Paginación del lado del servidor |
| `manualFiltering` | `true` | Filtrado del lado del servidor |
| `manualSorting` | `true` | Ordenamiento del lado del servidor |

## Reglas Críticas

✅ **SÍ hacer:**
- Carpeta `[entidad]-table/` (no archivo suelto)
- Estados con `React.useState` directo
- Import `DataTable` desde `@/components/ui/data-table`
- Flags `manual*` en `true`
- Skeleton mientras `isLoading`
- Exportar `columns` directamente (no `getColumns`)
- Columna ID con `<Link href={`${baseUrl}/${row.original.id}`}>` — **siempre** linkear al detalle del registro
- Columna de acciones con `DataTableRowActions` — componente local con `DropdownMenu` + `MoreHorizontal`
- Lógica de delete (mutation, toast, confirm) dentro de `DataTableRowActions`, no en `index.tsx`
- `DropdownMenu modal={false}` para evitar problemas de scroll dentro de la tabla
- `hasPermission` dentro de `DataTableRowActions` para controlar visibilidad de acciones

❌ **NO hacer:**
- Archivos sueltos en raíz de `tables/`
- Hooks custom para estados (`usePagination`, etc.)
- Omitir flags `manual*`
- Import incorrecto de `DataTable`
- Exportar `getColumns` (función que recibe callbacks) — no permite hooks en celdas
- Pasar `onDelete` como prop desde `index.tsx` — la celda se auto-gestiona

## Notes

- La tabla usa paginación, filtrado y ordenamiento del lado del servidor
- El hook `useGet[Entidades]Query` recibe todos los parámetros
- Backend debe implementar paginación y filtrado
- `<SkeletonTable />` se muestra mientras carga
- Cada columna debe tener `accessorFn`, `id`, `accessorKey`
