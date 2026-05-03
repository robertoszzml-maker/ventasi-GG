# Referencia Técnica - Hooks Frontend

Documentación técnica completa del patrón de hooks React Query.

## Estructura Estándar

### Template Completo

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

## Naming Conventions

### Archivo

**✅ CORRECTO:**
```
packages/front/src/hooks/equipamiento.tsx
packages/front/src/hooks/proveedor.tsx
packages/front/src/hooks/jornada.tsx
```

**❌ INCORRECTO:**
```
packages/front/src/hooks/useEquipamiento.tsx  // NO usar prefijo "use"
packages/front/src/hooks/useProveedor.tsx
packages/front/src/hooks/equipamientos.tsx    // NO usar plural
```

### Queries

**Para listados (plural):**
```typescript
export const useGet[Entidades]Query = (query: Query) => { ... }

// Ejemplos:
useGetEquipamientosQuery
useGetProveedoresQuery
useGetJornadasQuery
```

**Para detalle (singular):**
```typescript
export const useGet[Entidad]ByIdQuery = (id: number) => { ... }

// Ejemplos:
useGetEquipamientoByIdQuery
useGetProveedorByIdQuery
useGetJornadaByIdQuery
```

### Mutations

```typescript
// Crear
export const useCreate[Entidad]Mutation = () => { ... }

// Editar
export const useEdit[Entidad]Mutation = () => { ... }

// Eliminar
export const useDelete[Entidad]Mutation = () => { ... }

// Ejemplos:
useCreateEquipamientoMutation
useEditEquipamientoMutation
useDeleteEquipamientoMutation
```

## Query Keys

### Listados (plural)

```typescript
queryKey: ['equipamientos', query]  // Con parámetros de query
queryKey: ['proveedores', query]
queryKey: ['jornadas', query]
```

### Detalle (singular)

```typescript
queryKey: ['equipamiento', id]  // Con ID específico
queryKey: ['proveedor', id]
queryKey: ['jornada', id]
```

## Mutation Keys

Usar formato **kebab-case**:

```typescript
mutationKey: ['create-equipamiento']
mutationKey: ['edit-equipamiento']
mutationKey: ['delete-equipamiento']

mutationKey: ['create-proveedor']
mutationKey: ['edit-proveedor']
mutationKey: ['delete-proveedor']
```

## Imports Obligatorios

```typescript
// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
import { [Entidad], Query } from '@/types';

// Servicios (destructurados)
import { fetch, fetchById, create, edit, remove } from '@/services/[entidad]';
```

**❌ NO importar:**
```typescript
// INCORRECTO - No usar servicio como objeto
import { equipamientoService } from '@/services/equipamiento';
```

## Invalidación de Queries

### En Create y Delete

```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
}
```

### En Edit

```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
}
```

**Importante:** Invalidar usando el plural de la entidad para refrescar listados.

## Error Handling

Solo en `useDelete[Entidad]Mutation`:

```typescript
onError: (error) => {
    console.error('Error en eliminación:', error);
}
```

**Nota:** No agregar `onError` en Create y Edit, el manejo de errores se hace en el componente.

## Hooks Adicionales

Para funcionalidades específicas (ej: descarga Excel):

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

### En Formularios

```typescript
const { mutateAsync: create, isPending: isPendingCreate } = useCreateEquipamientoMutation();
const { mutateAsync: edit, isPending: isPendingEdit } = useEditEquipamientoMutation();

async function onSubmit(values) {
    if (data?.id) {
        await edit({ id: data.id, data: values });
    } else {
        await create(values);
    }
}
```

### En Tablas

```typescript
const { data = [], isLoading } = useGetEquipamientosQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
});
```

### En Páginas de Detalle

```typescript
const { data: equipamiento, isLoading } = useGetEquipamientoByIdQuery(id);
```

## Checklist de Validación

### Archivo
- [ ] Nombre en singular sin prefijo "use"
- [ ] Ubicado en `packages/front/src/hooks/`
- [ ] Extensión `.tsx`

### Imports
- [ ] React Query imports correctos
- [ ] Types importados desde `@/types`
- [ ] Servicios destructurados desde `@/services/[entidad]`

### Queries
- [ ] Listado con nombre plural y sufijo `Query`
- [ ] Detalle con nombre singular, `ById` y sufijo `Query`
- [ ] Query keys correctos (plural/singular)
- [ ] QueryFn llamando a servicio

### Mutations
- [ ] Create, Edit, Delete con sufijo `Mutation`
- [ ] MutationKey en kebab-case
- [ ] QueryClient inicializado
- [ ] Invalidación en `onSuccess`
- [ ] Error handling solo en Delete

### Convenciones
- [ ] Nombres en PascalCase
- [ ] Query keys en lowercase
- [ ] Mutation keys en kebab-case
- [ ] Sin importar servicio como objeto

## Anti-patrones

### ❌ Nombres Incorrectos

```typescript
// INCORRECTO
export const useEquipamientos = () => { ... }
export const useEquipamiento = (id: number) => { ... }
export const useCreateEquipamientoMutation = () => { ... }  // Falta "Get"

// CORRECTO
export const useGetEquipamientosQuery = (query) => { ... }
export const useGetEquipamientoByIdQuery = (id) => { ... }
export const useCreateEquipamientoMutation = () => { ... }
```

### ❌ Importar Servicio como Objeto

```typescript
// INCORRECTO
import { equipamientoService } from '@/services/equipamiento';
equipamientoService.findAll();

// CORRECTO
import { fetch, fetchById, create, edit, remove } from '@/services/equipamiento';
fetch(query);
```

### ❌ Falta de mutationKey

```typescript
// INCORRECTO
return useMutation({
    mutationFn: create,
    // Falta mutationKey
});

// CORRECTO
return useMutation({
    mutationKey: ['create-equipamiento'],
    mutationFn: create,
});
```

### ❌ Query sin Parámetros

```typescript
// INCORRECTO
export const useGetEquipamientosQuery = () => {
    return useQuery({
        queryKey: ['equipamientos'],  // Falta query como parámetro
        queryFn: () => fetch(),
    });
};

// CORRECTO
export const useGetEquipamientosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['equipamientos', query],
        queryFn: () => fetch(query),
    });
};
```

## Resumen

| Aspecto | Valor |
|---------|-------|
| Ubicación | `packages/front/src/hooks/<entidad>.tsx` |
| Naming | Archivo en singular sin "use" |
| Queries | `useGet[Entidades]Query` (plural) |
| Queries ID | `useGet[Entidad]ByIdQuery` (singular) |
| Mutations | `use[Accion][Entidad]Mutation` |
| Query Keys | Plural para listados, singular para detalle |
| Mutation Keys | kebab-case |
| Invalidación | En `onSuccess` con plural |
| Error Handling | Solo en Delete |
