# Template - Tablas Frontend

Plantillas para crear tablas TanStack. Reemplazar placeholders según la entidad.

## Placeholders

- `[Entidad]` → Nombre en PascalCase (ej: `Equipamiento`, `Proveedor`)
- `[entidad]` → Nombre en kebab-case (ej: `equipamiento`, `proveedor`)
- `[Entidades]` → Plural PascalCase (ej: `Equipamientos`, `Proveedores`)
- `[entidades]` → Plural kebab-case (ej: `equipamientos`, `proveedores`)
- `[ruta]` → Ruta base (ej: `/equipamiento`, `/proveedor`)

---

## Template - index.tsx

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

---

## Template - columns.tsx (Básico)

```typescript
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { [Entidad] } from "@/types"
import { CellColumn } from "@/components/ui/cell-column"
import Link from "next/link"

const baseUrl = "[ruta]"

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
  // Agregar más columnas aquí
]
```

---

## Template - Columna Simple

```typescript
{
  accessorFn: (row) => row.[campo],
  id: "[campo]",
  accessorKey: "[campo]",
  header: "[Label]",
  cell: ({ row }) => (
    <CellColumn>{row.getValue("[campo]") || "-"}</CellColumn>
  ),
}
```

---

## Template - Columna con Link

```typescript
{
  accessorFn: (row) => row.[campo],
  id: "[campo]",
  accessorKey: "[campo]",
  header: "[Label]",
  cell: ({ row }) => (
    <Link href={`${baseUrl}/${row.original.id}`}>
      <CellColumn>{row.getValue("[campo]")}</CellColumn>
    </Link>
  ),
}
```

---

## Template - Columna de Acciones (DataTableRowActions)

```typescript
// Imports necesarios en columns.tsx:
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
import { hasPermission } from "@/hooks/use-access"
import { PERMISOS } from "@/constants/permisos"
import { useDelete[Entidad]Mutation } from "@/hooks/[entidad]"
import { useToast } from "@/hooks/use-toast"

// Componente local (antes del array columns):
const DataTableRowActions = ({ data }: { data: [Entidad] }) => {
  const { toast } = useToast()
  const { mutateAsync: delete[Entidad] } = useDelete[Entidad]Mutation()
  const canEdit = hasPermission(PERMISOS.[ENTIDAD]_EDITAR)
  const canDelete = hasPermission(PERMISOS.[ENTIDAD]_ELIMINAR)

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${data.nombre}"?`)) return
    try {
      await delete[Entidad](data.id!)
      toast({ description: "[Entidad] eliminado/a" })
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

// Columna en el array columns:
{
  id: "acciones",
  header: "Acciones",
  enableColumnFilter: false,
  cell: ({ row }) => <DataTableRowActions data={row.original} />,
}
```

> **IMPORTANTE**: `DataTableRowActions` es un componente local en `columns.tsx`. Usar `DropdownMenu modal={false}` para evitar problemas de scroll. Nunca usar `getColumns` ni pasar callbacks desde `index.tsx`.

---

## Template - Columna con Relación

```typescript
{
  accessorFn: (row) => row.[relacion]?.[campo],
  id: "[relacion]",
  accessorKey: "[relacion].[campo]",
  header: "[Label]",
  cell: ({ row }) => (
    <CellColumn>{row.original.[relacion]?.[campo] || "-"}</CellColumn>
  ),
}
```

---

## Template - Columna Fecha

```typescript
import { formatDate } from "@/utils/date";

{
  accessorFn: (row) => row.[campoFecha],
  id: "[campoFecha]",
  accessorKey: "[campoFecha]",
  header: "[Label]",
  cell: ({ row }) => (
    <CellColumn>
      {row.getValue("[campoFecha]") ? formatDate(row.getValue("[campoFecha]")) : "-"}
    </CellColumn>
  ),
}
```

---

## Template - Columna DateTime

```typescript
import { formatTime } from "@/utils/date";

{
  accessorFn: (row) => row.[campoDateTime],
  id: "[campoDateTime]",
  accessorKey: "[campoDateTime]",
  header: "[Label]",
  cell: ({ row }) => (
    <CellColumn>
      {row.getValue("[campoDateTime]") ? formatTime(row.getValue("[campoDateTime]")) : "-"}
    </CellColumn>
  ),
}
```

---

## Template - Columna Monetaria

```typescript
import { formatCurrency } from "@/helpers/currency";

{
  accessorFn: (row) => row.[campoMonetario],
  id: "[campoMonetario]",
  accessorKey: "[campoMonetario]",
  header: "[Label]",
  cell: ({ row }) => (
    <CellColumn>
      {row.getValue("[campoMonetario]")
        ? `$ ${formatCurrency(row.getValue("[campoMonetario]"))}`
        : "-"}
    </CellColumn>
  ),
}
```

---

## Template - Página de Listado

```typescript
import [Entidad]Table from "@/components/tables/[entidad]-table";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function [Entidad]ListPage() {
  return (
    <>
      <div className="flex justify-between items-center">
        <PageTitle title="[Entidades]" />
        <Link href="[ruta]/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear [Entidad]
          </Button>
        </Link>
      </div>
      <[Entidad]Table />
    </>
  );
}
```

---

## Ejemplo de Reemplazo

### Para Equipamiento

```typescript
// Reemplazos:
[Entidad] → Equipamiento
[entidad] → equipamiento
[Entidades] → Equipamientos
[entidades] → equipamientos
[ruta] → /equipamiento

// Resultado index.tsx:
export default function EquipamientoTable() {
  // ...
  const { data = [], isLoading } = useGetEquipamientosQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
  });
  // ...
}

// Resultado columns.tsx:
const baseUrl = "/equipamiento"

export const columns: ColumnDef<Equipamiento>[] = [
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
  // ...
]
```

### Para Proveedor

```typescript
// Reemplazos:
[Entidad] → Proveedor
[entidad] → proveedor
[Entidades] → Proveedores
[entidades] → proveedores
[ruta] → /proveedor

// Resultado:
export default function ProveedorTable() {
  const { data = [], isLoading } = useGetProveedoresQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
  });
  // ...
}
```

---

## Checklist de Reemplazo

- [ ] Reemplazar `[Entidad]` con PascalCase
- [ ] Reemplazar `[entidad]` con kebab-case
- [ ] Reemplazar `[Entidades]` con plural PascalCase
- [ ] Reemplazar `[entidades]` con plural kebab-case
- [ ] Reemplazar `[ruta]` con ruta base
- [ ] Verificar imports correctos
- [ ] Verificar hook `useGet[Entidades]Query` existe
- [ ] Verificar columnas tienen `accessorFn`, `id`, `accessorKey`
- [ ] Verificar flags `manual*` en `true`
- [ ] Verificar skeleton en loading

---

## Columnas Completas - Equipamiento

```typescript
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Equipamiento } from "@/types"
import { CellColumn } from "@/components/ui/cell-column"
import Link from "next/link"

const baseUrl = "/equipamiento"

export const columns: ColumnDef<Equipamiento>[] = [
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
    accessorFn: (row) => row.patente,
    id: "patente",
    accessorKey: "patente",
    header: "Patente",
    cell: ({ row }) => (
      <CellColumn>{row.getValue("patente") || "-"}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.tipo?.nombre,
    id: "tipo",
    accessorKey: "tipo.nombre",
    header: "Tipo",
    cell: ({ row }) => (
      <CellColumn>{row.original.tipo?.nombre || "-"}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.anio,
    id: "anio",
    accessorKey: "anio",
    header: "Año",
    cell: ({ row }) => (
      <CellColumn>{row.getValue("anio") || "-"}</CellColumn>
    ),
  },
]
```

---

## Resumen

| Template | Uso |
|----------|-----|
| index.tsx | Componente principal con estados TanStack |
| columns.tsx básico | Columnas ID + nombre |
| Columna simple | Campo sin link |
| Columna con link | Campo clickeable |
| Columna relación | `row.original.relacion?.campo` |
| Columna fecha | Con `formatDate()` |
| Columna datetime | Con `formatTime()` |
| Columna monetaria | Con `formatCurrency()` + `$` |
| Página listado | PageTitle + botón crear + tabla |
