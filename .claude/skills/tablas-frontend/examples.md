# Ejemplos - Tablas Frontend

Ejemplos completos de tablas TanStack.

## Ejemplo 1: EquipamientoTipoTable

### index.tsx

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

### columns.tsx

```typescript
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { EquipamientoTipo } from "@/types"
import { CellColumn } from "@/components/ui/cell-column"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { hasPermission } from "@/hooks/use-access"
import { PERMISOS } from "@/constants/permisos"
import { useDeleteEquipamientoTipoMutation } from "@/hooks/equipamiento-tipo"
import { useToast } from "@/hooks/use-toast"

const baseUrl = "/equipamiento-tipo"

const DataTableRowActions = ({ data }: { data: EquipamientoTipo }) => {
  const { toast } = useToast()
  const { mutateAsync: deleteEquipamientoTipo } = useDeleteEquipamientoTipoMutation()
  const canEdit = hasPermission(PERMISOS.EQUIPAMIENTO_TIPO_EDITAR)
  const canDelete = hasPermission(PERMISOS.EQUIPAMIENTO_TIPO_ELIMINAR)

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el tipo "${data.nombre}"?`)) return
    try {
      await deleteEquipamientoTipo(data.id!)
      toast({ description: "Tipo de equipamiento eliminado" })
    } catch {
      toast({ description: "Error al eliminar", variant: "destructive" })
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        {canEdit && (
          <Link href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </Link>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<EquipamientoTipo>[] = [
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
  {
    id: "acciones",
    header: "Acciones",
    enableColumnFilter: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
]
```

## Ejemplo 2: ProveedorTable con Relaciones

### index.tsx

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
import { useGetProveedoresQuery } from "@/hooks/proveedor";
import { columns } from "./columns";
import { SkeletonTable } from "@/components/skeletons/skeleton-table";

export default function ProveedorTable() {
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
  const { data = [], isLoading } = useGetProveedoresQuery({
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

### columns.tsx (con relaciones)

```typescript
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Proveedor } from "@/types"
import { CellColumn } from "@/components/ui/cell-column"
import Link from "next/link"

const baseUrl = "/proveedor"

export const columns: ColumnDef<Proveedor>[] = [
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
    accessorFn: (row) => row.razonSocial,
    id: "razonSocial",
    accessorKey: "razonSocial",
    header: "Razón Social",
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue("razonSocial")}</CellColumn>
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.cuit,
    id: "cuit",
    accessorKey: "cuit",
    header: "CUIT",
    cell: ({ row }) => (
      <CellColumn>{row.getValue("cuit") || "-"}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.categoria?.nombre,
    id: "categoria",
    accessorKey: "categoria.nombre",
    header: "Categoría",
    cell: ({ row }) => (
      <CellColumn>{row.original.categoria?.nombre || "-"}</CellColumn>
    ),
  },
]
```

## Ejemplo 3: JornadaTable con Fechas

### columns.tsx (con formateo de fechas)

```typescript
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Jornada } from "@/types"
import { CellColumn } from "@/components/ui/cell-column"
import Link from "next/link"
import { formatDate } from "@/utils/date"

const baseUrl = "/jornada"

export const columns: ColumnDef<Jornada>[] = [
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
    accessorFn: (row) => row.fechaInicio,
    id: "fechaInicio",
    accessorKey: "fechaInicio",
    header: "Fecha Inicio",
    cell: ({ row }) => (
      <CellColumn>{formatDate(row.getValue("fechaInicio"))}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.fechaFin,
    id: "fechaFin",
    accessorKey: "fechaFin",
    header: "Fecha Fin",
    cell: ({ row }) => (
      <CellColumn>
        {row.getValue("fechaFin") ? formatDate(row.getValue("fechaFin")) : "-"}
      </CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.procesoGeneral?.nombre,
    id: "procesoGeneral",
    accessorKey: "procesoGeneral.nombre",
    header: "Proceso",
    cell: ({ row }) => (
      <CellColumn>{row.original.procesoGeneral?.nombre || "-"}</CellColumn>
    ),
  },
]
```

## Ejemplo 4: Uso en Página

### app/(admin)/equipamiento-tipo/page.tsx

```typescript
import EquipamientoTipoTable from "@/components/tables/equipamiento-tipo-table";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function EquipamientoTipoListPage() {
  return (
    <>
      <div className="flex justify-between items-center">
        <PageTitle title="Tipos de Equipamiento" />
        <Link href="/equipamiento-tipo/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Tipo
          </Button>
        </Link>
      </div>
      <EquipamientoTipoTable />
    </>
  );
}
```

## Ejemplo 5: Hook de Datos

### hooks/equipamiento-tipo.tsx

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EquipamientoTipo, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/equipamiento-tipo';

export const useGetEquipamientoTiposQuery = (query: Query) => {
  return useQuery({
    queryKey: ['equipamiento-tipos', query],
    queryFn: () => fetch(query),
  });
};

export const useGetEquipamientoTipoByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['equipamiento-tipo', id],
    queryFn: () => fetchById(id),
  });
};

// ... más hooks
```

## Ejemplo 6: Servicio

### services/equipamiento-tipo.ts

```typescript
import { EquipamientoTipo, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'equipamiento-tipo';

const fetch = async (query: Query): Promise<EquipamientoTipo[]> => {
  return fetchClient<EquipamientoTipo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<EquipamientoTipo> => {
  return fetchClient<EquipamientoTipo>(`${basePath}/${id}`, 'GET');
};

const create = async (body: EquipamientoTipo): Promise<EquipamientoTipo> => {
  return fetchClient<EquipamientoTipo>(basePath, 'POST', body);
};

const edit = async (id: number, body: EquipamientoTipo): Promise<EquipamientoTipo> => {
  return fetchClient<EquipamientoTipo>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove
};
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Estructura

```
// ❌ INCORRECTO
components/tables/
├── equipamiento-tipo-table.tsx
└── equipamiento-tipo-columns.tsx

// ✅ CORRECTO
components/tables/
└── equipamiento-tipo-table/
    ├── index.tsx
    └── columns.tsx
```

### Import DataTable

```typescript
// ❌ INCORRECTO
import { DataTable } from "@/components/ui/data-table/data-table";

// ✅ CORRECTO
import { DataTable } from "@/components/ui/data-table";
```

### Estados

```typescript
// ❌ INCORRECTO - hooks custom inexistentes
import { usePagination, useSorting } from "@/hooks/use-table";
const { pagination, setPagination } = usePagination();

// ✅ CORRECTO - useState directo
const [pagination, setPagination] = React.useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
```

### Flags Manuales

```typescript
// ❌ INCORRECTO - sin flags
const table = useReactTable({
  data,
  columns,
});

// ✅ CORRECTO - con flags
const table = useReactTable({
  data,
  columns,
  manualPagination: true,
  manualFiltering: true,
  manualSorting: true,
});
```

### Definición de Columnas

```typescript
// ❌ INCORRECTO - falta accessorFn
{
  id: "nombre",
  header: "Nombre",
  cell: ({ row }) => <span>{row.getValue("nombre")}</span>,
}

// ✅ CORRECTO - completo
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

### Import en Página

```typescript
// ❌ INCORRECTO
import EquipamientoTipoTable from "@/components/tables/equipamiento-tipo-table/equipamiento-tipo-table";

// ✅ CORRECTO
import EquipamientoTipoTable from "@/components/tables/equipamiento-tipo-table";
```

## Resumen

| Caso de Uso | Componente | Patrón |
|-------------|-----------|--------|
| Tabla simple | index.tsx + columns.tsx | Estados + hook + useReactTable |
| Con relaciones | columns.tsx | `row.original.relacion?.campo` |
| Con fechas | columns.tsx | `formatDate(row.getValue("fecha"))` |
| En página | Importar tabla | `from "@/components/tables/[entidad]-table"` |
| Hook datos | hooks/[entidad].tsx | `useGet[Entidades]Query(query: Query)` |
| Servicio | services/[entidad].ts | `fetch(query)` con `generateQueryParams` |
