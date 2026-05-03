# Ejemplos: Servicios Frontend

## Ejemplo Completo: Equipamiento

**Ubicación:** `packages/front/src/services/equipamiento.ts`

```typescript
import { Equipamiento, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'equipamiento';

const fetch = async (query: Query): Promise<Equipamiento[]> => {
  return fetchClient<Equipamiento[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Equipamiento> => {
  return fetchClient<Equipamiento>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Equipamiento): Promise<Equipamiento> => {
  return fetchClient<Equipamiento>(basePath, 'POST', body);
};

const edit = async (id: number, body: Equipamiento): Promise<Equipamiento> => {
  return fetchClient<Equipamiento>(`${basePath}/${id}`, 'PATCH', body);
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

## Ejemplo con Métodos Adicionales: Jornada

**Ubicación:** `packages/front/src/services/jornada.ts`

```typescript
import { Jornada, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'jornada';

const fetch = async (query: Query): Promise<Jornada[]> => {
  return fetchClient<Jornada[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Jornada> => {
  return fetchClient<Jornada>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Jornada): Promise<Jornada> => {
  return fetchClient<Jornada>(basePath, 'POST', body);
};

const edit = async (id: number, body: Jornada): Promise<Jornada> => {
  return fetchClient<Jornada>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

// ✅ Método adicional para asociación M:N
const updateEquipamiento = async (id: number, equipamientoIds: number[]): Promise<Jornada> => {
  return fetchClient<Jornada>(`${basePath}/${id}/equipamiento`, 'PATCH', { equipamientoIds });
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  updateEquipamiento,  // ✅ Agregar al export
};
```

## Consumo desde Hooks

**Ubicación:** `packages/front/src/hooks/equipamiento.tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Equipamiento, Query } from '@/types';
import * as equipamientoService from '@/services/equipamiento';

export const useGetEquipamientosQuery = (query: Query) => {
  return useQuery({
    queryKey: ['equipamientos', query],
    queryFn: () => equipamientoService.fetch(query),
  });
};

export const useGetEquipamientoByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['equipamiento', id],
    queryFn: () => equipamientoService.fetchById(id),
  });
};

export const useCreateEquipamientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-equipamiento'],
    mutationFn: equipamientoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
    },
  });
};

export const useEditEquipamientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['edit-equipamiento'],
    mutationFn: ({ id, data }: { id: number; data: Equipamiento }) =>
      equipamientoService.edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
    },
  });
};

export const useDeleteEquipamientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-equipamiento'],
    mutationFn: equipamientoService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamientos'] });
    },
  });
};
```

**Nota:** El hook importa el servicio con `import * as service` para acceder a las funciones nombradas.

## Uso en Componentes

```typescript
import { useGetEquipamientosQuery, useCreateEquipamientoMutation } from '@/hooks/equipamiento';

function EquipamientoList() {
  const { data = [], isLoading } = useGetEquipamientosQuery({
    pagination: { pageIndex: 0, pageSize: 10 },
    columnFilters: [],
    sorting: [],
    globalFilter: "",
  });

  const { mutateAsync: create } = useCreateEquipamientoMutation();

  const handleCreate = async (values: Equipamiento) => {
    await create(values);
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.nombre}</div>
      ))}
    </div>
  );
}
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Imports

```typescript
// ❌ INCORRECTO
import { api } from './api';
import axios from 'axios';

// ✅ CORRECTO
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';
```

### Nombres de Funciones

```typescript
// ❌ INCORRECTO
const findAll = async (query: Query) => { ... };
const findOne = async (id: number) => { ... };
const update = async (id: number, body: Entidad) => { ... };

// ✅ CORRECTO
const fetch = async (query: Query) => { ... };
const fetchById = async (id: number) => { ... };
const edit = async (id: number, body: Entidad) => { ... };
```

### Exports

```typescript
// ❌ INCORRECTO
export const equipamientoService = {
  fetch,
  fetchById,
  create,
  edit,
  remove
};

export default {
  fetch,
  fetchById,
  create,
  edit,
  remove
};

// ✅ CORRECTO
export {
  fetch,
  fetchById,
  create,
  edit,
  remove
};
```

### Métodos HTTP

```typescript
// ❌ INCORRECTO - Usar PUT
const edit = async (id: number, body: Entidad) => {
  return fetchClient<Entidad>(`${basePath}/${id}`, 'PUT', body);
};

// ✅ CORRECTO - Usar PATCH
const edit = async (id: number, body: Entidad) => {
  return fetchClient<Entidad>(`${basePath}/${id}`, 'PATCH', body);
};
```

### Query Params

```typescript
// ❌ INCORRECTO - Construir manualmente
const fetch = async (query: Query) => {
  const queryString = `page=${query.page}&limit=${query.limit}`;
  return fetchClient<Entidad[]>(`${basePath}?${queryString}`, 'GET');
};

// ✅ CORRECTO - Usar generateQueryParams
const fetch = async (query: Query) => {
  return fetchClient<Entidad[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};
```

### Import en Hooks

```typescript
// ❌ INCORRECTO - Import directo
import { fetch } from '@/services/equipamiento';

export const useGetEquipamientosQuery = (query: Query) => {
  return useQuery({
    queryKey: ['equipamientos', query],
    queryFn: () => fetch(query),  // Nombre ambiguo
  });
};

// ✅ CORRECTO - Import con namespace
import * as equipamientoService from '@/services/equipamiento';

export const useGetEquipamientosQuery = (query: Query) => {
  return useQuery({
    queryKey: ['equipamientos', query],
    queryFn: () => equipamientoService.fetch(query),  // Claro y explícito
  });
};
```

## Casos de Uso Especiales

### 1. Servicio con Download

```typescript
const fetchExcel = async (query: Query): Promise<Blob> => {
  const queryParams = generateQueryParams(query);
  const response = await fetch(`${basePath}/excel?${queryParams}`);
  return await response.blob();
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  fetchExcel
};
```

### 2. Servicio con Upload

```typescript
const upload = async (id: number, file: File): Promise<Entidad> => {
  const formData = new FormData();
  formData.append('file', file);
  return fetchClient<Entidad>(`${basePath}/${id}/upload`, 'POST', formData);
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  upload
};
```

### 3. Servicio con Acción Custom

```typescript
const publish = async (id: number): Promise<Entidad> => {
  return fetchClient<Entidad>(`${basePath}/${id}/publish`, 'PATCH');
};

const archive = async (id: number): Promise<Entidad> => {
  return fetchClient<Entidad>(`${basePath}/${id}/archive`, 'PATCH');
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  publish,
  archive
};
```

## Notas de Implementación

1. **Consistencia de nombres** - Siempre usar los mismos nombres estándar
2. **Exports nombrados** - Facilita el tree-shaking y el autocomplete
3. **Import con namespace** - Mejora legibilidad en hooks
4. **PATCH no PUT** - Convención del proyecto para actualizaciones parciales
5. **generateQueryParams** - Centraliza lógica de query string
6. **fetchClient** - Maneja autenticación, errores y transformaciones
