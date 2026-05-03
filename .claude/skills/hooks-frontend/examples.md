# Ejemplos - Hooks Frontend

Casos de uso reales de hooks React Query en el proyecto.

## Ejemplo 1: Hook Básico - Equipamiento

```typescript
// packages/front/src/hooks/equipamiento.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Equipamiento, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/equipamiento';

export const useGetEquipamientosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['equipamientos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetEquipamientoByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['equipamiento', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateEquipamientoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-equipamiento'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
        },
    });
};

export const useEditEquipamientoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-equipamiento'],
        mutationFn: ({ id, data }: { id: number; data: Equipamiento }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
        },
    });
};

export const useDeleteEquipamientoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-equipamiento'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
```

## Ejemplo 2: Uso en Formulario

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateEquipamientoMutation,
  useEditEquipamientoMutation,
} from "@/hooks/equipamiento";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1),
  tipoId: z.number().optional(),
});

export default function EquipamientoForm({ data }) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      nombre: data?.nombre || "",
      tipoId: data?.tipoId,
    },
  });

  const { mutateAsync: create, isPending: isPendingCreate } =
    useCreateEquipamientoMutation();
  const { mutateAsync: edit, isPending: isPendingEdit } =
    useEditEquipamientoMutation();

  async function onSubmit(values) {
    try {
      if (values.id) {
        await edit({ id: values.id, data: values });
        toast({ description: "Equipamiento actualizado" });
      } else {
        await create(values);
        toast({ description: "Equipamiento creado" });
      }
      router.back();
    } catch (error) {
      toast({
        description: "Error al guardar",
        variant: "destructive",
      });
    }
  }

  const isPending = isPendingCreate || isPendingEdit;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}
      <button type="submit" disabled={isPending}>
        Guardar
      </button>
    </form>
  );
}
```

## Ejemplo 3: Uso en Tabla

```typescript
"use client";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { useGetEquipamientosQuery } from "@/hooks/equipamiento";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function EquipamientoTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data = [], isLoading } = useGetEquipamientosQuery({
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
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter,
    },
  });

  if (isLoading) return <div>Cargando...</div>;

  return <DataTable table={table} columns={columns} />;
}
```

## Ejemplo 4: Uso en Página de Detalle

```typescript
"use client";
import { useGetEquipamientoByIdQuery } from "@/hooks/equipamiento";
import { notFound } from "next/navigation";

export default function EquipamientoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);
  const { data: equipamiento, isLoading } = useGetEquipamientoByIdQuery(id);

  if (isLoading) return <div>Cargando...</div>;
  if (!equipamiento) return notFound();

  return (
    <div>
      <h1>{equipamiento.nombre}</h1>
      <p>Tipo: {equipamiento.tipo?.nombre}</p>
      {/* Más detalles */}
    </div>
  );
}
```

## Ejemplo 5: Hook con Descarga Excel

```typescript
// packages/front/src/hooks/equipamiento.tsx
import { useLoading } from "@/hooks/use-loading";

export const useDownloadEquipamientoExcel = () => {
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: async (query: Query) => {
      showLoading();
      const data = await fetchExcel(query);
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "equipamientos.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Error al descargar el archivo", error);
    },
    onSettled: () => {
      hideLoading();
    },
  });
};
```

**Uso:**
```typescript
const { mutate: downloadExcel } = useDownloadEquipamientoExcel();

<button onClick={() => downloadExcel(query)}>
  Descargar Excel
</button>
```

## Ejemplo 6: Proveedor (Entidad Simple)

```typescript
// packages/front/src/hooks/proveedor.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Proveedor, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/proveedor';

export const useGetProveedoresQuery = (query: Query) => {
    return useQuery({
        queryKey: ['proveedores', query],
        queryFn: () => fetch(query),
    });
};

export const useGetProveedorByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['proveedor', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateProveedorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-proveedor'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
    });
};

export const useEditProveedorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-proveedor'],
        mutationFn: ({ id, data }: { id: number; data: Proveedor }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
    });
};

export const useDeleteProveedorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-proveedor'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Naming del Archivo

```typescript
// ❌ INCORRECTO
packages/front/src/hooks/useEquipamiento.tsx
packages/front/src/hooks/equipamientos.tsx

// ✅ CORRECTO
packages/front/src/hooks/equipamiento.tsx
```

### Naming de Hooks

```typescript
// ❌ INCORRECTO
export const useEquipamientos = () => { ... }
export const useEquipamiento = (id: number) => { ... }

// ✅ CORRECTO
export const useGetEquipamientosQuery = (query: Query) => { ... }
export const useGetEquipamientoByIdQuery = (id: number) => { ... }
```

### Imports

```typescript
// ❌ INCORRECTO
import { equipamientoService } from '@/services/equipamiento';

const data = await equipamientoService.findAll();

// ✅ CORRECTO
import { fetch, fetchById, create, edit, remove } from '@/services/equipamiento';

const data = await fetch(query);
```

### Mutation Keys

```typescript
// ❌ INCORRECTO
return useMutation({
    mutationFn: create,
    // Falta mutationKey
});

// ✅ CORRECTO
return useMutation({
    mutationKey: ['create-equipamiento'],
    mutationFn: create,
});
```

### Query Keys

```typescript
// ❌ INCORRECTO
queryKey: ['equipamiento', query]  // Singular para listado
queryKey: ['equipamientos', id]    // Plural para detalle

// ✅ CORRECTO
queryKey: ['equipamientos', query]  // Plural para listado
queryKey: ['equipamiento', id]      // Singular para detalle
```

## Checklist por Ejemplo

### Para Hook Básico
- [ ] Archivo nombrado en singular
- [ ] 5 hooks exportados (Get query, GetById query, Create, Edit, Delete mutations)
- [ ] Query keys correctos (plural/singular)
- [ ] Mutation keys en kebab-case
- [ ] Invalidación en onSuccess
- [ ] Error handling solo en Delete

### Para Uso en Formulario
- [ ] Imports destructurados de hooks
- [ ] isPending para ambos (create y edit)
- [ ] mutateAsync en async/await
- [ ] Toast de éxito/error
- [ ] Router.back() después de guardar

### Para Uso en Tabla
- [ ] Estados de paginación, sorting, filtering
- [ ] Hook con query object completo
- [ ] Loading state
- [ ] Manual pagination/filtering/sorting

### Para Página de Detalle
- [ ] Hook con ID parseado
- [ ] Loading state
- [ ] Not found fallback
- [ ] Acceso a relaciones (ej: equipamiento.tipo)
