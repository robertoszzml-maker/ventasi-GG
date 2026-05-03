---
name: sistema-permisos
description: Control de acceso RBAC con permisos, roles y herencia jerárquica
license: MIT
---

# Sistema de Permisos (RBAC)

Sistema de control de acceso basado en roles (Role-Based Access Control) con herencia jerárquica.

## Input

- `<modulo>`: Nombre del módulo (ej: `equipamiento`, `proveedor`)
- `<acciones>`: Acciones CRUD (ver, crear, editar, eliminar)

**Ejemplo:** `/sistema-permisos equipamiento crear,editar,eliminar`

## Steps

1. **Agregar Constantes**
   - Backend: `packages/api/src/constants/permisos.ts`
   - Frontend: `packages/front/src/constants/permisos.ts` (IDÉNTICO)
   - Nomenclatura: `MODULO_ACCION`, `RUTA_MODULO`, `MODULO_FILTRO_X`

2. **Proteger Endpoints Backend**
   - Decorador `@RequirePermissions(PERMISOS.X)`
   - Guards: `JwtAuthGuard`, `ApiKeyGuard`, `AuthorizationGuard`
   - Por endpoint o por controlador

3. **Migración SQL**
   - INSERT en tabla `permissions` (codigo, descripcion, modulo)
   - ❌ NO asignar a roles en migración

4. **Verificar en Frontend**
   - Hook `hasPermission(PERMISOS.X)`
   - Mostrar/ocultar componentes según permiso

## Output

**Backend:**
```typescript
// constants/permisos.ts
EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",

// controller
@RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
@Get()
findAll() { }
```

**Frontend:**
```typescript
// constants/permisos.ts (IDÉNTICO)
EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",

// componente
const canCreate = hasPermission(PERMISOS.EQUIPAMIENTO_CREAR);
{canCreate && <Button>Crear</Button>}
```

**SQL:**
```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');
```

## Recursos

- [📖 Referencia](reference.md) - Patrones completos RBAC
- [💡 Ejemplos](examples.md) - Casos de uso reales
- [📋 Template](template.md) - Código base para copiar

## 3 Pasos Obligatorios

| Paso | Ubicación | Acción |
|------|-----------|--------|
| 1 | Backend + Frontend | Agregar constantes (IDÉNTICOS) |
| 2 | Backend | Proteger endpoints con `@RequirePermissions` |
| 3 | SQL | INSERT permissions (sin role_permissions) |

## Reglas Críticas

✅ **SÍ hacer:**
- Backend === Frontend (constantes idénticas)
- `as const` al final del objeto PERMISOS
- Guards completos: `JwtAuthGuard + ApiKeyGuard + AuthorizationGuard`
- Solo INSERT permissions en SQL
- Verificar permisos con `hasPermission(PERMISOS.X)`

❌ **NO hacer:**
- Constantes diferentes en backend y frontend
- `@RequirePermissions` sin guards
- INSERT en `role_permissions` en migración
- Hardcodear strings de permisos
- Omitir `as const`

## Nomenclatura

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| CRUD | `<MODULO>_<ACCION>` | `EQUIPAMIENTO_VER` |
| Filtros | `<MODULO>_FILTRO_<DESC>` | `EQUIPAMIENTO_FILTRO_VER_PROPIOS` |
| Rutas | `RUTA_<NOMBRE>` | `RUTA_EQUIPAMIENTO` |
| Acciones | `<MODULO>_<ACCION_ESPECIFICA>` | `EQUIPAMIENTO_EXPORTAR_PDF` |

### Separador de palabras

**SIEMPRE usar guion bajo `_`, NUNCA guion medio `-`.**

Módulos con múltiples palabras: todas separadas con `_`.

```
✅ CORRECTO:
ENVIO_NOTIFICACION_VER
RUTA_ENVIOS_NOTIFICACION
PLANTILLA_NOTIFICACION_CREAR

❌ INCORRECTO:
ENVIO-NOTIFICACION_VER
RUTA-ENVIOS-NOTIFICACION
PLANTILLA-NOTIFICACION_CREAR
```

> El campo `modulo` en el INSERT de `permissions` también usa guion bajo.
> Ej: `'envio_notificacion'`, `'plantilla_notificacion'`.

## Notes

- Sistema con herencia jerárquica automática
- Permisos se cargan en `app/(admin)/layout.tsx` (Zustand)
- Helper backend es async: `await hasPermission()`
- Hook frontend es sync: `hasPermission()`
- Guards verifican automáticamente en cada request
- Asignación de permisos a roles se hace manualmente (NO en migración)
