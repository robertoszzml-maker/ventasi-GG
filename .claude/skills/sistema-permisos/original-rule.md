# Sistema de Permisos (RBAC)

Control de acceso basado en roles con herencia jerárquica.

## 3 Pasos Obligatorios

1. Backend: `packages/api/src/constants/permisos.ts`
2. Frontend: `packages/front/src/constants/permisos.ts` (IDÉNTICO)
3. Migración SQL: INSERT en tabla `permissions`

## 1. Constantes Backend & Frontend

```typescript
// Backend y Frontend IDÉNTICOS
export const PERMISOS = {
  // CRUD
  MI_MODULO_VER: "MI_MODULO_VER",
  MI_MODULO_CREAR: "MI_MODULO_CREAR",
  MI_MODULO_EDITAR: "MI_MODULO_EDITAR",
  MI_MODULO_ELIMINAR: "MI_MODULO_ELIMINAR",

  // Filtros
  MI_MODULO_FILTRO_VER_PROPIOS: "MI_MODULO_FILTRO_VER_PROPIOS",
  MI_MODULO_FILTRO_VER_TODOS: "MI_MODULO_FILTRO_VER_TODOS",

  // Rutas
  RUTA_MI_MODULO: "RUTA_MI_MODULO",

  // Acciones específicas
  MI_MODULO_EXPORTAR_PDF: "MI_MODULO_EXPORTAR_PDF",
} as const;
```

**Nomenclatura:**
- CRUD: `<MODULO>_<ACCION>`
- Filtros: `<MODULO>_FILTRO_<DESC>`
- Rutas: `RUTA_<NOMBRE>`
- Acciones: `<MODULO>_<ACCION_ESPECIFICA>`

## 2. Proteger Endpoints

```typescript
import { PERMISOS } from "@/constants/permisos";
import { RequirePermissions } from "@/modules/auth/decorators/require-permissions/require-permissions.decorator";

@Controller("mi-modulo")
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)  // ✅ Obligatorio
export class MiController {
  @RequirePermissions(PERMISOS.MI_MODULO_VER)
  @Get()
  findAll() { }

  @RequirePermissions(PERMISOS.MI_MODULO_CREAR)
  @Post()
  create() { }

  @RequirePermissions(PERMISOS.MI_MODULO_EDITAR)
  @Patch(':id')
  update() { }

  @RequirePermissions(PERMISOS.MI_MODULO_ELIMINAR)
  @Delete(':id')
  remove() { }
}
```

## 3. Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('MI_MODULO_VER', 'Ver registros', 'mi-modulo'),
('MI_MODULO_CREAR', 'Crear registros', 'mi-modulo'),
('MI_MODULO_EDITAR', 'Editar registros', 'mi-modulo'),
('MI_MODULO_ELIMINAR', 'Eliminar registros', 'mi-modulo'),
('RUTA_MI_MODULO', 'Acceso a página', 'rutas');

-- ❌ NO asignar a roles en migración
```

## Verificar Permisos

### Backend

```typescript
import { hasPermission } from '@/helpers/has-permissions.helper';
import { PERMISOS } from '@/constants/permisos';

async someMethod() {
  const canEdit = await hasPermission(PERMISOS.PRESUPUESTOS_EDITAR);
  if (canEdit) {
    // Permitir acción
  }
}
```

### Frontend

```typescript
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';

function MyComponent() {
  const canEdit = hasPermission(PERMISOS.PRESUPUESTOS_EDITAR);

  return (
    <>
      {canEdit && <Button>Editar</Button>}
    </>
  );
}
```

## Servicio de Permisos

```typescript
// Verificar si rol tiene permisos (con herencia)
await permissionsService.roleHasPermissions(roleId, [
  PERMISOS.PRESUPUESTOS_VER,
  PERMISOS.PRESUPUESTOS_EDITAR,
]);

// Obtener permisos de un rol
const permisos = await permissionsService.getRolePermissions(roleId);

// Asignar permiso
await permissionsService.assignPermissionToRole(roleId, permissionId);

// Configurar permisos (reemplaza existentes)
await permissionsService.setRolePermissions(roleId, [permissionId1, permissionId2]);
```

## Carga en Frontend

Permisos se cargan en `app/(admin)/layout.tsx` y se almacenan en Zustand:

```typescript
const { setPermissions } = useStore();

React.useEffect(() => {
  const checkAccess = async () => {
    const result = await fetchClient("auth/check-session", "POST");
    setPermissions(result?.permissions ?? []);
  };
  checkAccess();
}, []);
```

## Ejemplo Completo

### Backend

```typescript
// constants/permisos.ts
EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",

// equipamiento.controller.ts
@Controller("equipamiento")
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoController {
  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get()
  findAll() { }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_CREAR)
  @Post()
  create() { }
}
```

### Frontend

```typescript
// constants/permisos.ts (IDÉNTICO)
EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",

// componente
const canCreate = hasPermission(PERMISOS.EQUIPAMIENTO_CREAR);
{canCreate && <Button>Crear</Button>}
```

### SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento'),
('EQUIPAMIENTO_CREAR', 'Crear equipamiento', 'equipamiento'),
('RUTA_EQUIPAMIENTO', 'Acceso a página equipamiento', 'rutas');
```

## Anti-patrones

```typescript
// ❌ NO
export const PERMISOS = { X: "Y" }  // Sin as const
VER_PRESUPUESTOS !== PRESUPUESTOS_VER  // Backend ≠ Frontend
INSERT INTO role_permissions...  // En migración
@RequirePermissions sin @UseGuards  // Falta guards

// ✅ SÍ
as const al final
Backend === Frontend (idénticos)
Solo INSERT permissions (no roles)
@UseGuards + @RequirePermissions
```

## Resumen

| Aspecto | Valor |
|---------|-------|
| Backend | `packages/api/src/constants/permisos.ts` |
| Frontend | `packages/front/src/constants/permisos.ts` |
| Sync | Backend === Frontend (idénticos) |
| Decorador | `@RequirePermissions(PERMISOS.X)` |
| Guards | JwtAuthGuard + ApiKeyGuard + AuthorizationGuard |
| Helper Backend | `hasPermission(PERMISOS.X)` (async) |
| Hook Frontend | `hasPermission(PERMISOS.X)` |
| SQL | INSERT permissions (sin role_permissions) |
| Herencia | Soportada automáticamente |
