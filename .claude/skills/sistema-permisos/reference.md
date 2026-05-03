# Referencia Técnica - Sistema de Permisos

Documentación completa del sistema RBAC.

## Arquitectura RBAC

```
Usuario → Rol → Permisos → Acciones
         ↓
    Herencia jerárquica
```

## 1. Constantes de Permisos

### Backend: `packages/api/src/constants/permisos.ts`

```typescript
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
  MI_MODULO_EXPORTAR_EXCEL: "MI_MODULO_EXPORTAR_EXCEL",
} as const;
```

### Frontend: `packages/front/src/constants/permisos.ts`

```typescript
// ✅ DEBE SER IDÉNTICO AL BACKEND
export const PERMISOS = {
  MI_MODULO_VER: "MI_MODULO_VER",
  MI_MODULO_CREAR: "MI_MODULO_CREAR",
  MI_MODULO_EDITAR: "MI_MODULO_EDITAR",
  MI_MODULO_ELIMINAR: "MI_MODULO_ELIMINAR",
  // ... resto igual
} as const;
```

**⚠️ CRÍTICO:** Backend y frontend deben ser IDÉNTICOS.

## 2. Proteger Endpoints Backend

### Guards Obligatorios

```typescript
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';

@Controller("mi-modulo")
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)  // ✅ Obligatorio
export class MiController {
  // endpoints
}
```

### Decorador @RequirePermissions

```typescript
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';

@RequirePermissions(PERMISOS.MI_MODULO_VER)
@Get()
findAll() {
  return this.service.findAll();
}

@RequirePermissions(PERMISOS.MI_MODULO_CREAR)
@Post()
create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}

@RequirePermissions(PERMISOS.MI_MODULO_EDITAR)
@Patch(':id')
update(@Param('id') id: number, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}

@RequirePermissions(PERMISOS.MI_MODULO_ELIMINAR)
@Delete(':id')
remove(@Param('id') id: number) {
  return this.service.remove(id);
}
```

### Múltiples Permisos (OR)

```typescript
@RequirePermissions(PERMISOS.ADMIN_GLOBAL, PERMISOS.MI_MODULO_VER)  // OR
@Get()
findAll() { }
```

## 3. Migración SQL

### INSERT Permissions

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
-- CRUD
('MI_MODULO_VER', 'Ver registros de mi módulo', 'mi-modulo'),
('MI_MODULO_CREAR', 'Crear registros en mi módulo', 'mi-modulo'),
('MI_MODULO_EDITAR', 'Editar registros de mi módulo', 'mi-modulo'),
('MI_MODULO_ELIMINAR', 'Eliminar registros de mi módulo', 'mi-modulo'),

-- Filtros
('MI_MODULO_FILTRO_VER_PROPIOS', 'Ver solo registros propios', 'mi-modulo'),
('MI_MODULO_FILTRO_VER_TODOS', 'Ver todos los registros', 'mi-modulo'),

-- Rutas
('RUTA_MI_MODULO', 'Acceso a la página de mi módulo', 'rutas'),

-- Acciones específicas
('MI_MODULO_EXPORTAR_PDF', 'Exportar PDF', 'mi-modulo'),
('MI_MODULO_EXPORTAR_EXCEL', 'Exportar Excel', 'mi-modulo');
```

**⚠️ NO asignar a roles:**
```sql
-- ❌ INCORRECTO - No hacer esto en migración
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 42);
```

## 4. Verificar Permisos

### Backend - Helper

```typescript
import { hasPermission } from '@/helpers/has-permissions.helper';
import { PERMISOS } from '@/constants/permisos';

async someMethod() {
  const canEdit = await hasPermission(PERMISOS.PRESUPUESTOS_EDITAR);

  if (canEdit) {
    // Permitir acción
  } else {
    throw new UnauthorizedException('Sin permiso');
  }
}
```

**Nota:** Helper backend es **async**.

### Frontend - Hook

```typescript
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';

function MyComponent() {
  const canEdit = hasPermission(PERMISOS.PRESUPUESTOS_EDITAR);
  const canDelete = hasPermission(PERMISOS.PRESUPUESTOS_ELIMINAR);

  return (
    <>
      {canEdit && <Button>Editar</Button>}
      {canDelete && <Button variant="destructive">Eliminar</Button>}
    </>
  );
}
```

**Nota:** Hook frontend es **sync**.

## 5. Servicio de Permisos

### Métodos Disponibles

```typescript
import { PermissionsService } from '@/modules/permissions/permissions.service';

// Verificar si rol tiene permisos (con herencia)
await permissionsService.roleHasPermissions(roleId, [
  PERMISOS.PRESUPUESTOS_VER,
  PERMISOS.PRESUPUESTOS_EDITAR,
]);

// Obtener permisos de un rol
const permisos = await permissionsService.getRolePermissions(roleId);

// Asignar permiso a rol
await permissionsService.assignPermissionToRole(roleId, permissionId);

// Configurar permisos (reemplaza existentes)
await permissionsService.setRolePermissions(roleId, [permissionId1, permissionId2]);

// Remover permiso de rol
await permissionsService.removePermissionFromRole(roleId, permissionId);
```

## 6. Carga de Permisos Frontend

### Layout Principal

```typescript
// app/(admin)/layout.tsx
import { useStore } from '@/stores/store';
import { fetchClient } from '@/lib/api-client';

export default function AdminLayout({ children }) {
  const { setPermissions } = useStore();

  React.useEffect(() => {
    const checkAccess = async () => {
      const result = await fetchClient("auth/check-session", "POST");
      setPermissions(result?.permissions ?? []);
    };
    checkAccess();
  }, []);

  return <>{children}</>;
}
```

### Store Zustand

```typescript
// stores/store.ts
interface StoreState {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),
}));
```

## 7. Nomenclatura de Permisos

### CRUD

```typescript
EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
EQUIPAMIENTO_EDITAR: "EQUIPAMIENTO_EDITAR",
EQUIPAMIENTO_ELIMINAR: "EQUIPAMIENTO_ELIMINAR",
```

### Filtros

```typescript
EQUIPAMIENTO_FILTRO_VER_PROPIOS: "EQUIPAMIENTO_FILTRO_VER_PROPIOS",
EQUIPAMIENTO_FILTRO_VER_TODOS: "EQUIPAMIENTO_FILTRO_VER_TODOS",
```

### Rutas

```typescript
RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",
RUTA_EQUIPAMIENTO_CONFIG: "RUTA_EQUIPAMIENTO_CONFIG",
```

### Acciones Específicas

```typescript
EQUIPAMIENTO_EXPORTAR_PDF: "EQUIPAMIENTO_EXPORTAR_PDF",
EQUIPAMIENTO_EXPORTAR_EXCEL: "EQUIPAMIENTO_EXPORTAR_EXCEL",
EQUIPAMIENTO_IMPORTAR: "EQUIPAMIENTO_IMPORTAR",
```

## 8. Herencia de Roles

El sistema soporta herencia jerárquica automática:

```
Admin
  └─ Supervisor
       └─ Usuario
```

Si un rol tiene permiso, todos los roles hijos lo heredan.

## Anti-patrones

```typescript
// ❌ NO - Sin as const
export const PERMISOS = {
  X: "Y"
}

// ✅ SÍ - Con as const
export const PERMISOS = {
  X: "X"
} as const;

// ❌ NO - Backend ≠ Frontend
// Backend: VER_PRESUPUESTOS
// Frontend: PRESUPUESTOS_VER

// ✅ SÍ - Backend === Frontend
// Backend: PRESUPUESTOS_VER
// Frontend: PRESUPUESTOS_VER

// ❌ NO - Sin guards
@RequirePermissions(PERMISOS.X)
@Get()

// ✅ SÍ - Con guards
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class Controller {
  @RequirePermissions(PERMISOS.X)
  @Get()
}

// ❌ NO - Hardcodear strings
if (hasPermission("EQUIPAMIENTO_VER"))

// ✅ SÍ - Usar constantes
if (hasPermission(PERMISOS.EQUIPAMIENTO_VER))

// ❌ NO - Asignar roles en SQL
INSERT INTO role_permissions...

// ✅ SÍ - Solo permisos en SQL
INSERT INTO permissions...
```

## Checklist

### Backend:
- [ ] Constantes en `constants/permisos.ts`
- [ ] `as const` al final
- [ ] Guards en controlador
- [ ] `@RequirePermissions` en endpoints
- [ ] SQL INSERT permissions
- [ ] NO asignar a roles en SQL

### Frontend:
- [ ] Constantes IDÉNTICAS en `constants/permisos.ts`
- [ ] `as const` al final
- [ ] Usar `hasPermission(PERMISOS.X)`
- [ ] Mostrar/ocultar según permiso
- [ ] NO hardcodear strings

### Sync:
- [ ] Backend === Frontend (verificar línea por línea)
- [ ] Nombres exactamente iguales
- [ ] Orden puede variar pero valores deben coincidir

## Resumen

| Aspecto | Valor |
|---------|-------|
| Backend constantes | `packages/api/src/constants/permisos.ts` |
| Frontend constantes | `packages/front/src/constants/permisos.ts` |
| Sync | Backend === Frontend (idénticos) |
| Decorador | `@RequirePermissions(PERMISOS.X)` |
| Guards | `JwtAuthGuard + ApiKeyGuard + AuthorizationGuard` |
| Helper backend | `await hasPermission(PERMISOS.X)` (async) |
| Hook frontend | `hasPermission(PERMISOS.X)` (sync) |
| SQL | INSERT permissions (NO role_permissions) |
| Herencia | Automática (roles hijos heredan) |
| Carga frontend | `app/(admin)/layout.tsx` → Zustand |
