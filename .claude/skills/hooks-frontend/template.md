# Template - Hooks Frontend

Plantilla base para crear hooks React Query. Reemplazar los placeholders `[Entidad]` y `[entidad]`.

## Placeholders

- `[Entidad]` → Nombre en PascalCase singular (ej: `Equipamiento`, `Proveedor`, `Jornada`)
- `[Entidades]` → Nombre en PascalCase plural (ej: `Equipamientos`, `Proveedores`, `Jornadas`)
- `[entidad]` → Nombre en kebab-case singular (ej: `equipamiento`, `proveedor`, `jornada`)
- `[entidades]` → Nombre en kebab-case plural (ej: `equipamientos`, `proveedores`, `jornadas`)

## Template Completo

```typescript
// packages/front/src/hooks/[entidad].tsx
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

## Ejemplo de Reemplazo

Para la entidad `producto`:

```typescript
// packages/front/src/hooks/producto.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Producto, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/producto';

export const useGetProductosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['productos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetProductoByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['producto', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateProductoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-producto'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
        },
    });
};

export const useEditProductoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-producto'],
        mutationFn: ({ id, data }: { id: number; data: Producto }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
        },
    });
};

export const useDeleteProductoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-producto'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
```

## Template para Hook Adicional (ej: Descarga Excel)

```typescript
export const useDownload[Entidad]Excel = () => {
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
            a.download = '[entidades].xlsx';
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

## Checklist de Reemplazo

- [ ] Reemplazar `[Entidad]` con PascalCase singular
- [ ] Reemplazar `[Entidades]` con PascalCase plural
- [ ] Reemplazar `[entidad]` con kebab-case singular
- [ ] Reemplazar `[entidades]` con kebab-case plural
- [ ] Verificar que el servicio existe en `@/services/[entidad]`
- [ ] Verificar que el type existe en `@/types`
- [ ] Guardar en `packages/front/src/hooks/[entidad].tsx`

## Mapeo de Nombres Comunes

| Singular | Plural | PascalCase Singular | PascalCase Plural |
|----------|--------|---------------------|-------------------|
| producto | productos | Producto | Productos |
| cliente | clientes | Cliente | Clientes |
| proveedor | proveedores | Proveedor | Proveedores |
| categoria | categorias | Categoria | Categorias |
| usuario | usuarios | Usuario | Usuarios |
| pedido | pedidos | Pedido | Pedidos |
| factura | facturas | Factura | Facturas |
| equipamiento | equipamientos | Equipamiento | Equipamientos |
| jornada | jornadas | Jornada | Jornadas |

## Casos Especiales

### Entidades con Nombres Compuestos

```typescript
// equip
amiento-tipo → EquipamientoTipo, equipamiento-tipos
// cuenta-contable → CuentaContable, cuentas-contables
// proceso-general → ProcesoGeneral, procesos-generales
```

**Ejemplo:**
```typescript
// packages/front/src/hooks/equipamiento-tipo.tsx
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

// ... resto de mutations
```
