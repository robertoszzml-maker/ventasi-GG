# Referencia Técnica - Tablas Frontend

Documentación completa de patrones TanStack Table.

## Estructura de Carpetas

```
components/tables/
└── [entidad]-table/       # ✅ Singular con sufijo -table
    ├── index.tsx          # Componente principal
    └── columns.tsx        # Definición de columnas
```

**Ejemplos:**
- ✅ `cuenta-contable-table/`
- ✅ `equipamiento-tipo-table/`
- ❌ `cuenta-contable-table.tsx` (archivo suelto)

## Template index.tsx

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

## Template columns.tsx

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

## Estados Requeridos

```typescript
// Ordenamiento
const [sorting, setSorting] = React.useState<SortingState>([]);

// Búsqueda global
const [globalFilter, setGlobalFilter] = React.useState("");

// Filtros por columna
const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

// Visibilidad de columnas
const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

// Selección de filas
const [rowSelection, setRowSelection] = React.useState({});

// Paginación
const [pagination, setPagination] = React.useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
```

## Configuración useReactTable

```typescript
const table = useReactTable({
  data,
  columns,
  // Handlers
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onRowSelectionChange: setRowSelection,
  onPaginationChange: setPagination,
  onGlobalFilterChange: setGlobalFilter,
  // Models
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  // Manual flags (CRÍTICO)
  manualPagination: true,
  manualFiltering: true,
  manualSorting: true,
  // State
  state: {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    pagination,
    globalFilter,
  },
});
```

## Columnas - Propiedades Requeridas

```typescript
{
  accessorFn: (row) => row.campo,  // ✅ Función para obtener valor
  id: "campo",                      // ✅ ID único
  accessorKey: "campo",             // ✅ Key para acceso
  header: "Campo",                  // Header texto
  cell: ({ row }) => (              // Renderizado custom
    <CellColumn>{row.getValue("campo")}</CellColumn>
  ),
  enableColumnFilter: false,        // Opcional: desactivar filtro
}
```

## Tipos de Columnas

### Columna con Link

```typescript
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
}
```

### Columna ID (sin filtro)

```typescript
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
  enableColumnFilter: false,  // ✅ Desactivar filtro en ID
}
```

### Columna con Relación

```typescript
{
  accessorFn: (row) => row.tipo?.nombre,
  id: "tipo",
  accessorKey: "tipo.nombre",
  header: "Tipo",
  cell: ({ row }) => (
    <CellColumn>{row.original.tipo?.nombre || "-"}</CellColumn>
  ),
}
```

### Columna Fecha

```typescript
import { formatDate } from "@/utils/date";

{
  accessorFn: (row) => row.fecha,
  id: "fecha",
  accessorKey: "fecha",
  header: "Fecha",
  cell: ({ row }) => (
    <CellColumn>{formatDate(row.getValue("fecha"))}</CellColumn>
  ),
}
```

## Hook de Datos

```typescript
import { useGet[Entidades]Query } from "@/hooks/[entidad]";

const { data = [], isLoading } = useGet[Entidades]Query({
  pagination,      // { pageIndex, pageSize }
  columnFilters,   // Filtros por columna
  sorting,         // Ordenamiento
  globalFilter,    // Búsqueda global
});
```

**El hook debe aceptar objeto `Query`:**
```typescript
// hooks/[entidad].tsx
export const useGet[Entidades]Query = (query: Query) => {
  return useQuery({
    queryKey: ['[entidades]', query],
    queryFn: () => fetch(query),
  });
};
```

## Import en Páginas

```typescript
import [Entidad]Table from "@/components/tables/[entidad]-table";

export default function [Entidad]ListPage() {
  return (
    <>
      <PageTitle title="[Entidades]" />
      <[Entidad]Table />
    </>
  );
}
```

## Anti-patrones

```typescript
// ❌ Archivo suelto
components/tables/equipamiento-table.tsx

// ✅ Carpeta con index
components/tables/equipamiento-table/index.tsx

// ❌ Import incorrecto DataTable
import { DataTable } from "@/components/ui/data-table/data-table";

// ✅ Import correcto
import { DataTable } from "@/components/ui/data-table";

// ❌ Hook custom para estados
import { usePagination } from "@/hooks/use-table";

// ✅ useState directo
const [pagination, setPagination] = React.useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

// ❌ Sin flags manuales
const table = useReactTable({ data, columns });

// ✅ Con flags manuales
const table = useReactTable({
  data,
  columns,
  manualPagination: true,
  manualFiltering: true,
  manualSorting: true,
});

// ❌ Columna sin accessorFn
{
  id: "nombre",
  header: "Nombre",
}

// ✅ Columna completa
{
  accessorFn: (row) => row.nombre,
  id: "nombre",
  accessorKey: "nombre",
  header: "Nombre",
  cell: ({ row }) => <CellColumn>{row.getValue("nombre")}</CellColumn>,
}
```

## Checklist

### Estructura:
- [ ] Carpeta `[entidad]-table/` en `components/tables/`
- [ ] Archivos `index.tsx` + `columns.tsx`

### index.tsx:
- [ ] `"use client"` al inicio
- [ ] Imports TanStack correctos
- [ ] Import `DataTable` desde `@/components/ui/data-table`
- [ ] Import hook `useGet[Entidades]Query`
- [ ] Import `columns` desde `"./columns"`
- [ ] Import `SkeletonTable`
- [ ] Estados con `React.useState`
- [ ] Hook con parámetros `{ pagination, columnFilters, sorting, globalFilter }`
- [ ] `useReactTable` con config completa
- [ ] Flags `manual*` en `true`
- [ ] Skeleton mientras `isLoading`
- [ ] Return `<DataTable table={table} columns={columns} />`

### columns.tsx:
- [ ] `"use client"` al inicio
- [ ] Cada columna: `accessorFn`, `id`, `accessorKey`
- [ ] Links usan `row.original.id`
- [ ] Celdas en `<CellColumn>`
- [ ] `enableColumnFilter: false` para ID

### Integración:
- [ ] Hook implementado en `hooks/[entidad].tsx`
- [ ] Servicio en `services/[entidad].ts`
- [ ] Import correcto en página

## Resumen

| Aspecto | Valor |
|---------|-------|
| Ubicación | `components/tables/[entidad]-table/` |
| Archivos | `index.tsx` + `columns.tsx` |
| Import DataTable | `@/components/ui/data-table` |
| Import en página | `@/components/tables/[entidad]-table` |
| Estados | `React.useState` directo |
| Flags | `manualPagination`, `manualFiltering`, `manualSorting` = `true` |
| Loading | `<SkeletonTable />` |
| Columnas | `accessorFn` + `id` + `accessorKey` |
