---
name: hooks-frontend
description: Crear hooks React Query siguiendo el patrón estándar del proyecto
license: MIT
---

# Hooks Frontend (React Query)

Genera hooks React Query con el patrón estándar del proyecto para cualquier entidad.

## Input

- `<entidad>`: Nombre de la entidad en singular (ej: `equipamiento`, `proveedor`, `jornada`)

**Ejemplo:** `/hooks-frontend producto`

## Steps

1. **Validar Input**
   - Verificar que se proporcionó nombre de entidad
   - Convertir a singular si está en plural
   - Generar nombres en PascalCase y kebab-case

2. **Crear Archivo de Hook**
   - Ubicación: `packages/front/src/hooks/<entidad>.tsx`
   - Nombre del archivo en **singular** (NO usar prefijo "use")
   - Usar template de [template.md](template.md)

3. **Generar Hooks**
   - `useGet[Entidades]Query` - Listado con paginación
   - `useGet[Entidad]ByIdQuery` - Detalle por ID
   - `useCreate[Entidad]Mutation` - Crear
   - `useEdit[Entidad]Mutation` - Editar
   - `useDelete[Entidad]Mutation` - Eliminar

4. **Configurar React Query**
   - Query keys en plural para listados
   - Query keys en singular para detalle
   - Mutation keys en kebab-case
   - Invalidación automática en mutaciones

5. **Validar**
   - Verificar imports correctos
   - Verificar naming conventions
   - Verificar estructura de queryClient

## Output

```typescript
// packages/front/src/hooks/<entidad>.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [Entidad], Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/[entidad]';

export const useGet[Entidades]Query = (query: Query) => { ... }
export const useGet[Entidad]ByIdQuery = (id: number) => { ... }
export const useCreate[Entidad]Mutation = () => { ... }
export const useEdit[Entidad]Mutation = () => { ... }
export const useDelete[Entidad]Mutation = () => { ... }
```

## Recursos

- [📖 Referencia Técnica](reference.md) - Patrones y reglas detalladas
- [💡 Ejemplos](examples.md) - Casos de uso reales
- [📋 Template](template.md) - Plantilla base

## Naming Conventions

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Archivo | `<entidad>.tsx` | `equipamiento.tsx` |
| Query (listado) | `useGet[Entidades]Query` | `useGetEquipamientosQuery` |
| Query (detalle) | `useGet[Entidad]ByIdQuery` | `useGetEquipamientoByIdQuery` |
| Mutation | `use[Accion][Entidad]Mutation` | `useCreateEquipamientoMutation` |
| Query Key (listado) | `['<entidades>', query]` | `['equipamientos', query]` |
| Query Key (detalle) | `['<entidad>', id]` | `['equipamiento', id]` |
| Mutation Key | `['<accion>-<entidad>']` | `['create-equipamiento']` |

## Reglas Críticas

❌ **NO hacer:**
- Nombrar archivo con prefijo "use" (ej: `useEquipamiento.tsx`)
- Usar nombres sin "Get" en queries (ej: `useEquipamientos`)
- Olvidar `mutationKey` en mutations
- Importar servicio como objeto
- Omitir invalidación de queries

✅ **SÍ hacer:**
- Archivo en singular sin prefijo: `equipamiento.tsx`
- Queries con "Get": `useGetEquipamientosQuery`
- Incluir `mutationKey` en todas las mutations
- Imports destructurados del servicio
- Invalidar queries en `onSuccess`

## Notes

- Los hooks se consumen directamente en componentes
- El servicio asociado debe existir en `packages/front/src/services/`
- El type debe existir en `packages/front/src/types/index.d.ts`
- React Query maneja automáticamente cache y estado
