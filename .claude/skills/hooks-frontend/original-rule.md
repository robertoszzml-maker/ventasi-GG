# Reglas para Hooks Frontend (React Query)

## Patrón Obligatorio

Todos los hooks en `packages/front/src/hooks/` DEBEN seguir este patrón exacto basado en React Query.

**IMPORTANTE:** Los archivos de hooks se nombran con el nombre de la entidad en **singular**, NO con el prefijo "use":
- ✅ `equipamiento.tsx`
- ✅ `proveedor.tsx`
- ✅ `jornada.tsx`
- ❌ `useEquipamiento.tsx`
- ❌ `useProveedor.tsx`

## Estructura Estándar

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [Entidad], Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/[entidad]';

export const useGet[Entidades]Query = (query: Query) => {
    return useQuery({
        queryKey: ['[entidades]', query],
        queryFn: () => fetch(query),
    });
};

export const useGet[Entidad]ByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['[entidad]', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreate[Entidad]Mutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-[entidad]'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['[entidades]'] });
        },
    });
};

export const useEdit[Entidad]Mutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-[entidad]'],
        mutationFn: ({ id, data }: { id: number; data: [Entidad] }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['[entidades]'] });
        },
    });
};

export const useDelete[Entidad]Mutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-[entidad]'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['[entidades]'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
```

## Reglas Críticas

### 1. ✅ Naming Convention

**Queries:**
- `useGet[Entidades]Query` - Para obtener listado (plural)
- `useGet[Entidad]ByIdQuery` - Para obtener por ID (singular)

**Mutations:**
- `useCreate[Entidad]Mutation` - Para crear
- `useEdit[Entidad]Mutation` - Para editar
- `useDelete[Entidad]Mutation` - Para eliminar

**Incorrecto:**
```typescript
// ❌ NO usar estos nombres
export const useEquipamientos = () => { ... }
export const useEquipamiento = (id: number) => { ... }
export const useCreateEquipamientoMutation = () => { ... }  // Falta "Get" en queries
```

**Correcto:**
```typescript
// ✅ Usar estos nombres
export const useGetEquipamientosQuery = (query: Query) => { ... }
export const useGetEquipamientoByIdQuery = (id: number) => { ... }
export const useCreateEquipamientoMutation = () => { ... }
export const useEditEquipamientoMutation = () => { ... }
export const useDeleteEquipamientoMutation = () => { ... }
```

### 2. ✅ Imports Obligatorios

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [Entidad], Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/[entidad]';
```

**NO importar:**
```typescript
// ❌ NO usar
import { equipamientoService } from '@/services/equipamiento';
```

### 3. ✅ Query Keys

**Para listados (plural):**
```typescript
queryKey: ['equipamientos', query]  // Con parámetros de query
```

**Para detalle (singular):**
```typescript
queryKey: ['equipamiento', id]  // Con ID específico
```

### 4. ✅ Mutation Keys

Usar formato kebab-case:
```typescript
mutationKey: ['create-equipamiento']
mutationKey: ['edit-equipamiento']
mutationKey: ['delete-equipamiento']
```

### 5. ✅ Invalidación de Queries

**En Create y Delete:**
```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
}
```

**En Edit:**
```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
}
```

### 6. ✅ Error Handling

Solo en `useDelete[Entidad]Mutation`:
```typescript
onError: (error) => {
    console.error('Error en eliminación:', error);
}
```

## Ejemplo Completo

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

## Hooks Adicionales

Para funcionalidades adicionales (como descargas Excel):

```typescript
export const useDownloadEquipamientoExcel = () => {
    const { showLoading, hideLoading } = useLoading();

    return useMutation({
        mutationFn: async (query: Query) => {
            showLoading();
            const data = await fetchExcel(query);
            const blob = new Blob([data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'equipamientos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        },
        onError: (error) => {
            console.error('Error al descargar el archivo', error);
        },
        onSettled: () => {
            hideLoading();
        }
    });
};
```

## Consumo en Componentes

```typescript
// En formularios
const { mutateAsync: create, isPending: isPendingCreate } = useCreateEquipamientoMutation();
const { mutateAsync: edit, isPending: isPendingEdit } = useEditEquipamientoMutation();

// En tablas
const { data = [], isLoading } = useGetEquipamientosQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
});

// En páginas de detalle
const { data: equipamiento, isLoading } = useGetEquipamientoByIdQuery(id);
```

## ❌ Anti-patrones Comunes

1. **Nombres incorrectos:**
   ```typescript
   // ❌ INCORRECTO
   export const useEquipamientos = () => { ... }
   export const useEquipamiento = (id) => { ... }

   // ✅ CORRECTO
   export const useGetEquipamientosQuery = (query) => { ... }
   export const useGetEquipamientoByIdQuery = (id) => { ... }
   ```

2. **Importar servicio como objeto:**
   ```typescript
   // ❌ INCORRECTO
   import { equipamientoService } from '@/services/equipamiento';
   equipamientoService.findAll();

   // ✅ CORRECTO
   import { fetch, fetchById, create, edit, remove } from '@/services/equipamiento';
   fetch(query);
   ```

3. **Falta de mutationKey:**
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

4. **Query sin parámetros:**
   ```typescript
   // ❌ INCORRECTO
   export const useGetEquipamientosQuery = () => {
       return useQuery({
           queryKey: ['equipamientos'],  // Falta query como parámetro
           queryFn: () => fetch(),
       });
   };

   // ✅ CORRECTO
   export const useGetEquipamientosQuery = (query: Query) => {
       return useQuery({
           queryKey: ['equipamientos', query],
           queryFn: () => fetch(query),
       });
   };
   ```
