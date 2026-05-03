# Reglas para Tablas Frontend (TanStack Table)

## Estructura Obligatoria

Todas las tablas en `packages/front/src/components/tables/` DEBEN seguir este patrón exacto.

---

## 🗂️ Estructura de Carpetas

```
components/tables/
└── [entidad]-table/       # ✅ Nombre en singular con sufijo -table
    ├── index.tsx          # Componente principal de tabla
    └── columns.tsx        # Definición de columnas
```

**Ejemplos:**
- ✅ `cuenta-contable-table/`
- ✅ `equipamiento-tipo-table/`
- ✅ `inventario-table/`
- ❌ `cuenta-contable-columns.tsx` (en raíz de tables/)
- ❌ `cuenta-contable-table.tsx` (archivo suelto)

---

## 📄 Archivo index.tsx (Componente Principal)

### Template (COPIAR EXACTAMENTE)

```typescript
"use client";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { useGet[Entidades]Query } from "@/hooks/[entidad]";
import { columns } from "./columns";
import { SkeletonTable } from "@/components/skeletons/skeleton-table";

export default function [Entidad]Table() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data = [], isLoading } = useGet[Entidades]Query({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
  });
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
  });

  if (isLoading) return <SkeletonTable />;

  return (
    <>
      <DataTable table={table} columns={columns} />
    </>
  );
}
```

### Ejemplo Real: EquipamientoTipoTable

```typescript
"use client";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { useGetEquipamientoTiposQuery } from "@/hooks/equipamiento-tipo";
import { columns } from "./columns";
import { SkeletonTable } from "@/components/skeletons/skeleton-table";

export default function EquipamientoTipoTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data = [], isLoading } = useGetEquipamientoTiposQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
  });
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
  });

  if (isLoading) return <SkeletonTable />;

  return (
    <>
      <DataTable table={table} columns={columns} />
    </>
  );
}
```

---

## 📄 Archivo columns.tsx

Ver las reglas específicas en `.claude/rules/columnas-tabla-frontend.md` (si existe) o usar el patrón estándar:

```typescript
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { [Entidad] } from "@/types"
import { CellColumn } from "@/components/ui/cell-column"
import Link from "next/link"

const baseUrl = "/[ruta-entidad]"

export const columns: ColumnDef<[Entidad]>[] = [
  {
    accessorFn: (row) => row.id,
    id: "id",
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue("id")}</CellColumn>
      </Link>
    ),
    enableColumnFilter: false,
  },
  {
    accessorFn: (row) => row.nombre,
    id: "nombre",
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue("nombre")}</CellColumn>
      </Link>
    ),
  },
  // ... más columnas
]
```

---

## 🚨 Errores Comunes

### ❌ NO hacer:

1. **Archivo suelto en raíz de tables/**
   ```
   // ❌ INCORRECTO
   components/tables/equipamiento-tipo-table.tsx
   components/tables/equipamiento-tipo-columns.tsx

   // ✅ CORRECTO
   components/tables/equipamiento-tipo-table/
   ├── index.tsx
   └── columns.tsx
   ```

2. **Import incorrecto de DataTable:**
   ```typescript
   // ❌ INCORRECTO
   import { DataTable } from "@/components/ui/data-table/data-table";

   // ✅ CORRECTO
   import { DataTable } from "@/components/ui/data-table";
   ```

3. **Usar hooks personalizados inexistentes:**
   ```typescript
   // ❌ INCORRECTO
   import { usePagination, useSorting } from "@/hooks/use-table";

   // ✅ CORRECTO (usar useState directamente)
   const [pagination, setPagination] = React.useState<PaginationState>({
     pageIndex: 0,
     pageSize: 10,
   });
   ```

4. **Olvidar manualPagination/manualFiltering/manualSorting:**
   ```typescript
   // ❌ INCORRECTO (sin manual flags)
   const table = useReactTable({
     data,
     columns,
     // ...
   });

   // ✅ CORRECTO
   const table = useReactTable({
     data,
     columns,
     manualPagination: true,
     manualFiltering: true,
     manualSorting: true,
     // ...
   });
   ```

5. **Import incorrecto en páginas:**
   ```typescript
   // ❌ INCORRECTO
   import EquipamientoTipoTable from "@/components/tables/equipamiento-tipo-table/equipamiento-tipo-table";

   // ✅ CORRECTO
   import EquipamientoTipoTable from "@/components/tables/equipamiento-tipo-table";
   ```

---

## ✅ Checklist

### Estructura:
- [ ] Carpeta `[entidad]-table/` creada en `components/tables/`
- [ ] Archivo `index.tsx` con componente principal
- [ ] Archivo `columns.tsx` con definición de columnas

### index.tsx:
- [ ] `"use client"` al inicio
- [ ] Imports de TanStack Table correctos
- [ ] Import de `DataTable` desde `@/components/ui/data-table`
- [ ] Import de hook `useGet[Entidades]Query`
- [ ] Import de `columns` desde `"./columns"`
- [ ] Import de `SkeletonTable`
- [ ] Estados declarados con `React.useState`
- [ ] `useReactTable` con todas las configuraciones
- [ ] Flags `manual*` en `true`
- [ ] Skeleton mientras carga
- [ ] Return con `<DataTable table={table} columns={columns} />`

### columns.tsx:
- [ ] `"use client"` al inicio
- [ ] Cada columna tiene `accessorFn`, `id`, `accessorKey`
- [ ] Links usan `row.original.id`
- [ ] Celdas envueltas en `<CellColumn>`
- [ ] `enableColumnFilter: false` para ID

### Integración:
- [ ] Import correcto en página: `from "@/components/tables/[entidad]-table"`
- [ ] Hook `useGet[Entidades]Query` implementado en `hooks/[entidad].tsx`
- [ ] Servicio implementado en `services/[entidad].ts`

---

## 📋 Resumen Rápido

| Aspecto | Valor |
|---------|-------|
| Ubicación | `components/tables/[entidad]-table/` |
| Archivos | `index.tsx` + `columns.tsx` |
| Import DataTable | `@/components/ui/data-table` |
| Import en página | `@/components/tables/[entidad]-table` |
| Estados | `React.useState` directo (NO hooks custom) |
| Manual flags | `manualPagination`, `manualFiltering`, `manualSorting` |
| Loading | `<SkeletonTable />` |
