# Reglas para Servicios Frontend (Services Layer)

## Patrón Obligatorio

Todos los servicios en `packages/front/src/services/` DEBEN seguir este patrón exacto:

### Estructura Estándar

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

## Reglas Críticas

### 1. ✅ Imports Obligatorios

**Correcto:**
```typescript
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';
```

**Incorrecto:**
```typescript
import { api } from './api';           // ❌ NO existe
import axios from 'axios';             // ❌ NO usar directamente
```

### 2. ✅ Nombres de Funciones

- `fetch` (no `findAll`)
- `fetchById` (no `findOne`)
- `create` (no `store`)
- `edit` (no `update`)
- `remove` (no `delete`)

### 3. ✅ Exports Nombrados

**Correcto:**
```typescript
export { fetch, fetchById, create, edit, remove };
```

**Incorrecto:**
```typescript
export const equipamientoService = { ... };  // ❌ NO usar objeto
export default { ... };                       // ❌ NO usar default
```

### 4. ✅ Método HTTP Correcto

- GET: `fetchClient<T>(url, 'GET')`
- POST: `fetchClient<T>(url, 'POST', body)`
- PATCH: `fetchClient<T>(url, 'PATCH', body)` (no PUT)
- DELETE: `fetchClient<T>(url, 'DELETE')`

### 5. ✅ Parámetros de Query

Para `fetch()`, siempre usar `Query` type y `generateQueryParams()`:

```typescript
const fetch = async (query: Query): Promise<Entidad[]> => {
  return fetchClient<Entidad[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};
```

## Ejemplo Completo

```typescript
// packages/front/src/services/equipamiento.ts
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

## Métodos Adicionales

Si el servicio necesita métodos adicionales (como `updateEquipamiento` en jornada):

```typescript
const metodoAdicional = async (id: number, data: any): Promise<Entidad> => {
  return fetchClient<Entidad>(`${basePath}/${id}/ruta-adicional`, 'PATCH', data);
};

export {
  fetch,
  fetchById,
  create,
  edit,
  remove,
  metodoAdicional  // Agregar al export
};
```

## Consumo desde Hooks

Los hooks usan las funciones exportadas del servicio:

```typescript
// packages/front/src/hooks/useEquipamiento.tsx
import * as equipamientoService from '@/services/equipamiento';

export const useEquipamientos = (query: Query) => {
  return useQuery({
    queryKey: ['equipamientos', query],
    queryFn: () => equipamientoService.fetch(query),
  });
};
```

## ❌ Anti-patrones Comunes

1. **NO usar objetos exportados:**
   ```typescript
   // ❌ INCORRECTO
   export const equipamientoService = { fetch, create };

   // ✅ CORRECTO
   export { fetch, create };
   ```

2. **NO importar `api` inexistente:**
   ```typescript
   // ❌ INCORRECTO
   import { api } from './api';

   // ✅ CORRECTO
   import fetchClient from '@/lib/api-client';
   ```

3. **NO usar axios directamente:**
   ```typescript
   // ❌ INCORRECTO
   import axios from 'axios';

   // ✅ CORRECTO
   import fetchClient from '@/lib/api-client';
   ```
