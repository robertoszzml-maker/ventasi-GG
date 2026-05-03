# Referencia Técnica: Servicios Frontend

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

Nombres estándar obligatorios:
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

- **GET**: `fetchClient<T>(url, 'GET')`
- **POST**: `fetchClient<T>(url, 'POST', body)`
- **PATCH**: `fetchClient<T>(url, 'PATCH', body)` ⚠️ **NO PUT**
- **DELETE**: `fetchClient<T>(url, 'DELETE')`

### 5. ✅ Parámetros de Query

Para `fetch()`, siempre usar `Query` type y `generateQueryParams()`:

```typescript
const fetch = async (query: Query): Promise<Entidad[]> => {
  return fetchClient<Entidad[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};
```

**⚠️ Importante:** El tipo `Query` incluye parámetros de paginación, filtrado y ordenamiento del servidor.

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
  metodoAdicional  // ✅ Agregar al export
};
```

**Casos de uso:**
- Endpoints custom para asociaciones M:N
- Operaciones especiales (publicar, archivar, etc.)
- Acciones batch

## basePath

```typescript
const basePath = 'nombre-recurso';
```

**Reglas:**
- Sin `/` inicial ni final
- Kebab-case si es compuesto
- Singular si el backend usa singular

**Ejemplos:**
```typescript
const basePath = 'equipamiento';         // ✅
const basePath = 'cuenta-contable';      // ✅
const basePath = '/equipamiento';        // ❌ Sin /
const basePath = 'equipamiento/';        // ❌ Sin /
```

## Tipos de Retorno

Usar tipos genéricos con `fetchClient`:

```typescript
// Listado
Promise<Entidad[]>

// Detalle
Promise<Entidad>

// Crear/Editar
Promise<Entidad>

// Eliminar
Promise<void>
```

## Consumo desde Hooks

Los hooks importan el servicio y usan sus funciones:

```typescript
// packages/front/src/hooks/equipamiento.tsx
import * as equipamientoService from '@/services/equipamiento';

export const useGetEquipamientosQuery = (query: Query) => {
  return useQuery({
    queryKey: ['equipamientos', query],
    queryFn: () => equipamientoService.fetch(query),
  });
};
```

**⚠️ Importante:** Importar con `import * as service` para acceder a funciones nombradas.

## Anti-patrones

### 1. ❌ NO usar objetos exportados

```typescript
// ❌ INCORRECTO
export const equipamientoService = { fetch, create };

// ✅ CORRECTO
export { fetch, create };
```

### 2. ❌ NO importar `api` inexistente

```typescript
// ❌ INCORRECTO
import { api } from './api';

// ✅ CORRECTO
import fetchClient from '@/lib/api-client';
```

### 3. ❌ NO usar axios directamente

```typescript
// ❌ INCORRECTO
import axios from 'axios';
const response = await axios.get('/equipamiento');

// ✅ CORRECTO
import fetchClient from '@/lib/api-client';
const response = await fetchClient<Equipamiento[]>('equipamiento', 'GET');
```

### 4. ❌ NO usar PUT para actualizaciones

```typescript
// ❌ INCORRECTO
fetchClient<Entidad>(`${basePath}/${id}`, 'PUT', body);

// ✅ CORRECTO
fetchClient<Entidad>(`${basePath}/${id}`, 'PATCH', body);
```

### 5. ❌ NO usar nombres no estándar

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

## Checklist de Implementación

- [ ] Import `fetchClient` de `@/lib/api-client`
- [ ] Import `generateQueryParams` de `@/utils/query-helper`
- [ ] Import types de `@/types`
- [ ] basePath configurado correctamente
- [ ] Función `fetch` con `Query` y `generateQueryParams`
- [ ] Función `fetchById` con ID
- [ ] Función `create` con body
- [ ] Función `edit` con ID y body (PATCH)
- [ ] Función `remove` con ID (DELETE)
- [ ] Exports nombrados (NO objeto, NO default)
- [ ] Sin axios directo
- [ ] Sin imports inexistentes

## Ubicación

**Archivo:** `packages/front/src/services/[nombre-entidad].ts`

**Ejemplos:**
- `packages/front/src/services/equipamiento.ts`
- `packages/front/src/services/cuenta-contable.ts`
- `packages/front/src/services/jornada.ts`

**Nomenclatura:**
- Singular si la entidad es singular
- Kebab-case si es nombre compuesto
- Sin sufijo `-service`
