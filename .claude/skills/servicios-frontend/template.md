# Template: Nuevo Servicio Frontend

Este template muestra cómo crear un nuevo servicio frontend siguiendo el patrón estándar.

**Variables a reemplazar:**
- `[Entidad]` - Nombre de la entidad (ej: Equipamiento)
- `[entidad]` - Nombre en minúscula (ej: equipamiento)
- `[nombre-recurso]` - Endpoint base (ej: equipamiento, cuenta-contable)

## Template Base

**Ubicación:** `packages/front/src/services/[entidad].ts`

```typescript
import { [Entidad], Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = '[nombre-recurso]';

const fetch = async (query: Query): Promise<[Entidad][]> => {
  return fetchClient<[Entidad][]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}`, 'GET');
};

const create = async (body: [Entidad]): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(basePath, 'POST', body);
};

const edit = async (id: number, body: [Entidad]): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}`, 'PATCH', body);
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

## Template con Métodos Adicionales

```typescript
import { [Entidad], Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = '[nombre-recurso]';

const fetch = async (query: Query): Promise<[Entidad][]> => {
  return fetchClient<[Entidad][]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}`, 'GET');
};

const create = async (body: [Entidad]): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(basePath, 'POST', body);
};

const edit = async (id: number, body: [Entidad]): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

// ✅ Métodos adicionales según necesidad

// Asociación M:N
const updateAsociacion = async (id: number, asociadosIds: number[]): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}/asociacion`, 'PATCH', { asociadosIds });
};

// Acción custom
const publicar = async (id: number): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}/publicar`, 'PATCH');
};

// Download
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
  updateAsociacion,
  publicar,
  fetchExcel
};
```

## Ejemplo Concreto: CuentaContable

**Ubicación:** `packages/front/src/services/cuenta-contable.ts`

```typescript
import { CuentaContable, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'cuenta-contable';

const fetch = async (query: Query): Promise<CuentaContable[]> => {
  return fetchClient<CuentaContable[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<CuentaContable> => {
  return fetchClient<CuentaContable>(`${basePath}/${id}`, 'GET');
};

const create = async (body: CuentaContable): Promise<CuentaContable> => {
  return fetchClient<CuentaContable>(basePath, 'POST', body);
};

const edit = async (id: number, body: CuentaContable): Promise<CuentaContable> => {
  return fetchClient<CuentaContable>(`${basePath}/${id}`, 'PATCH', body);
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

## Checklist de Implementación

### Archivo:
- [ ] Ubicación correcta: `packages/front/src/services/[entidad].ts`
- [ ] Nombre en singular (sin sufijo `-service`)
- [ ] Kebab-case si es nombre compuesto

### Imports:
- [ ] `import fetchClient from '@/lib/api-client'`
- [ ] `import { generateQueryParams } from '@/utils/query-helper'`
- [ ] `import { [Entidad], Query } from '@/types'`

### Variables:
- [ ] `basePath` definido correctamente
- [ ] Sin `/` inicial ni final en basePath

### Funciones CRUD:
- [ ] `fetch(query: Query)` implementada
- [ ] `fetchById(id: number)` implementada
- [ ] `create(body: [Entidad])` implementada
- [ ] `edit(id: number, body: [Entidad])` implementada con PATCH
- [ ] `remove(id: number)` implementada con DELETE

### Exports:
- [ ] Exports nombrados (NO objeto)
- [ ] NO default export
- [ ] Todas las funciones incluidas en export

### Métodos HTTP:
- [ ] GET para fetch y fetchById
- [ ] POST para create
- [ ] PATCH para edit (NO PUT)
- [ ] DELETE para remove

### Tipos:
- [ ] `Promise<[Entidad][]>` para fetch
- [ ] `Promise<[Entidad]>` para fetchById, create, edit
- [ ] `Promise<void>` para remove

## Integración con Hooks

Después de crear el servicio, crear el hook correspondiente:

**Ubicación:** `packages/front/src/hooks/[entidad].tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [Entidad], Query } from '@/types';
import * as [entidad]Service from '@/services/[entidad]';

export const useGet[Entidad]sQuery = (query: Query) => {
  return useQuery({
    queryKey: ['[entidad]s', query],
    queryFn: () => [entidad]Service.fetch(query),
  });
};

export const useGet[Entidad]ByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['[entidad]', id],
    queryFn: () => [entidad]Service.fetchById(id),
  });
};

export const useCreate[Entidad]Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-[entidad]'],
    mutationFn: [entidad]Service.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entidad]s'] });
    },
  });
};

export const useEdit[Entidad]Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['edit-[entidad]'],
    mutationFn: ({ id, data }: { id: number; data: [Entidad] }) =>
      [entidad]Service.edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entidad]s'] });
    },
  });
};

export const useDelete[Entidad]Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-[entidad]'],
    mutationFn: [entidad]Service.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entidad]s'] });
    },
  });
};
```

## Casos de Uso Especiales

### 1. Download Excel

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

### 2. Upload de Archivo

```typescript
const upload = async (id: number, file: File): Promise<[Entidad]> => {
  const formData = new FormData();
  formData.append('file', file);
  return fetchClient<[Entidad]>(`${basePath}/${id}/upload`, 'POST', formData);
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

### 3. Asociación M:N

```typescript
const updateAsociados = async (id: number, asociadosIds: number[]): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}/asociados`, 'PATCH', { asociadosIds });
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  updateAsociados
};
```

### 4. Acción Custom (Publicar/Archivar)

```typescript
const publicar = async (id: number): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}/publicar`, 'PATCH');
};

const archivar = async (id: number): Promise<[Entidad]> => {
  return fetchClient<[Entidad]>(`${basePath}/${id}/archivar`, 'PATCH');
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  publicar,
  archivar
};
```

## Notas

- ⚠️ **SIEMPRE** usar PATCH para actualizaciones (NO PUT)
- ✅ **SIEMPRE** usar exports nombrados (NO objetos)
- ✅ **SIEMPRE** usar `generateQueryParams()` para query strings
- ✅ **SIEMPRE** importar servicio con namespace en hooks: `import * as service`
- ❌ **NUNCA** usar axios directamente
- ❌ **NUNCA** usar nombres no estándar (`findAll`, `update`, etc.)
