---
name: servicios-frontend
description: Servicios API con fetchClient y exports nombrados
license: MIT
---

# Servicios Frontend

Capa de servicios para llamadas API con fetchClient y exports nombrados.

## Descripción

Este skill implementa el patrón estándar para servicios frontend:
- Usar `fetchClient` de `@/lib/api-client`
- Exports nombrados (NO objetos ni default)
- Nombres estándar: `fetch`, `fetchById`, `create`, `edit`, `remove`
- PATCH para actualizaciones (no PUT)

## Input

Contexto de servicio:
- Nombre de la entidad (ej: Equipamiento)
- Endpoint base (ej: 'equipamiento')

**Ejemplo:** `/servicios-frontend` (crea o valida servicio)

## Steps

### 1. Validar Imports

- `fetchClient` de `@/lib/api-client`
- `generateQueryParams` de `@/utils/query-helper`
- Types de `@/types`

**❌ NO usar:** axios directo, api inexistente

### 2. Implementar Funciones CRUD

Nombres obligatorios:
- `fetch(query: Query)` - Listado con query params
- `fetchById(id: number)` - Detalle por ID
- `create(body: Entidad)` - Crear
- `edit(id: number, body: Entidad)` - Actualizar
- `remove(id: number)` - Eliminar

### 3. Configurar basePath

- Variable const con endpoint base
- Sin `/` inicial ni final
- Ejemplo: `'equipamiento'`

### 4. Métodos HTTP Correctos

- GET: listado y detalle
- POST: crear
- PATCH: actualizar (NO PUT)
- DELETE: eliminar

### 5. Query Params

- `fetch()` usa `generateQueryParams(query)`
- Tipo `Query` para parámetros

### 6. Exports Nombrados

```typescript
export {
  fetch,
  fetchById,
  create,
  edit,
  remove
};
```

**❌ NO:** objetos exportados, default export

### 7. Métodos Adicionales (Opcional)

Si necesita endpoints custom:
- Agregar función con nombre descriptivo
- Incluir en exports

## Output

Servicio implementado con:
- ✅ Imports correctos (`fetchClient`, `generateQueryParams`)
- ✅ Funciones CRUD estándar
- ✅ basePath configurado
- ✅ Métodos HTTP correctos (PATCH no PUT)
- ✅ Exports nombrados
- ✅ Sin anti-patrones

## Referencias

- **[reference.md](./reference.md)**: Reglas técnicas y anti-patrones
- **[examples.md](./examples.md)**: Ejemplo completo Equipamiento
- **[template.md](./template.md)**: Template para nuevo servicio

## Restricciones Críticas

1. **SIEMPRE** usar `fetchClient` de `@/lib/api-client`
2. **SIEMPRE** usar exports nombrados (NO objetos)
3. **SIEMPRE** usar nombres estándar: `fetch`, `fetchById`, `create`, `edit`, `remove`
4. **SIEMPRE** usar PATCH para actualizaciones (NO PUT)
5. **NUNCA** usar axios directamente
6. **NUNCA** usar objetos exportados o default export

## Notas

- ⚠️ **NO** inventar imports inexistentes (`api`, etc.)
- ✅ Hooks importan servicio con `import * as service from '@/services/...'`
- ✅ `generateQueryParams()` para query strings
