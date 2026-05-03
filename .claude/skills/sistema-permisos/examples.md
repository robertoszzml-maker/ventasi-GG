# Ejemplos - Sistema de Permisos

Casos de uso reales del sistema RBAC.

## Ejemplo 1: Módulo Equipamiento (CRUD Completo)

### Backend

#### constants/permisos.ts

```typescript
export const PERMISOS = {
  // Equipamiento - CRUD
  EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
  EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
  EQUIPAMIENTO_EDITAR: "EQUIPAMIENTO_EDITAR",
  EQUIPAMIENTO_ELIMINAR: "EQUIPAMIENTO_ELIMINAR",

  // Equipamiento - Rutas
  RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",

  // Equipamiento - Acciones
  EQUIPAMIENTO_EXPORTAR_EXCEL: "EQUIPAMIENTO_EXPORTAR_EXCEL",
} as const;
```

#### equipamiento.controller.ts

```typescript
import { Controller, Get, Post, Patch, Delete, UseGuards, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { EquipamientoService } from './equipamiento.service';

@Controller('equipamiento')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoController {
  constructor(private readonly service: EquipamientoService) {}

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_CREAR)
  @Post()
  create(@Body() dto: CreateEquipamientoDto) {
    return this.service.create(dto);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_EDITAR)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEquipamientoDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_ELIMINAR)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_EXPORTAR_EXCEL)
  @Get('export/excel')
  exportExcel() {
    return this.service.exportExcel();
  }
}
```

### Frontend

#### constants/permisos.ts (IDÉNTICO)

```typescript
export const PERMISOS = {
  EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
  EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
  EQUIPAMIENTO_EDITAR: "EQUIPAMIENTO_EDITAR",
  EQUIPAMIENTO_ELIMINAR: "EQUIPAMIENTO_ELIMINAR",
  RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",
  EQUIPAMIENTO_EXPORTAR_EXCEL: "EQUIPAMIENTO_EXPORTAR_EXCEL",
} as const;
```

#### equipamiento-list.tsx

```typescript
"use client";
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';
import EquipamientoTable from '@/components/tables/equipamiento-table';

export default function EquipamientoList() {
  const canCreate = hasPermission(PERMISOS.EQUIPAMIENTO_CREAR);
  const canExport = hasPermission(PERMISOS.EQUIPAMIENTO_EXPORTAR_EXCEL);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1>Equipamiento</h1>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          )}
          {canCreate && (
            <Link href="/equipamiento/crear">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear
              </Button>
            </Link>
          )}
        </div>
      </div>
      <EquipamientoTable />
    </>
  );
}
```

#### equipamiento-form.tsx

```typescript
"use client";
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function EquipamientoForm({ data }) {
  const canEdit = hasPermission(PERMISOS.EQUIPAMIENTO_EDITAR);
  const canDelete = hasPermission(PERMISOS.EQUIPAMIENTO_ELIMINAR);

  if (!data?.id) {
    // Modo crear - no mostrar botón eliminar
    return <form>{/* campos */}</form>;
  }

  return (
    <form>
      {/* campos del formulario */}

      <div className="flex justify-between">
        <div>
          {canDelete && (
            <Button variant="destructive" type="button">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
        <div>
          {canEdit && (
            <Button type="submit">Guardar Cambios</Button>
          )}
        </div>
      </div>
    </form>
  );
}
```

### SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento'),
('EQUIPAMIENTO_CREAR', 'Crear equipamiento', 'equipamiento'),
('EQUIPAMIENTO_EDITAR', 'Editar equipamiento', 'equipamiento'),
('EQUIPAMIENTO_ELIMINAR', 'Eliminar equipamiento', 'equipamiento'),
('RUTA_EQUIPAMIENTO', 'Acceso a página de equipamiento', 'rutas'),
('EQUIPAMIENTO_EXPORTAR_EXCEL', 'Exportar equipamiento a Excel', 'equipamiento');
```

## Ejemplo 2: Filtros de Visibilidad

### Backend

#### constants/permisos.ts

```typescript
export const PERMISOS = {
  PRESUPUESTO_VER: "PRESUPUESTO_VER",
  PRESUPUESTO_FILTRO_VER_PROPIOS: "PRESUPUESTO_FILTRO_VER_PROPIOS",
  PRESUPUESTO_FILTRO_VER_TODOS: "PRESUPUESTO_FILTRO_VER_TODOS",
} as const;
```

#### presupuesto.service.ts

```typescript
import { hasPermission } from '@/helpers/has-permissions.helper';
import { PERMISOS } from '@/constants/permisos';
import { getUser } from '@/helpers/get-user';

async findAll() {
  const canViewAll = await hasPermission(PERMISOS.PRESUPUESTO_FILTRO_VER_TODOS);

  if (canViewAll) {
    // Ver todos los presupuestos
    return await this.repository.find();
  } else {
    // Ver solo presupuestos propios
    const user = getUser();
    return await this.repository.find({
      where: { createdBy: user.id }
    });
  }
}
```

### SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('PRESUPUESTO_VER', 'Ver presupuestos', 'presupuesto'),
('PRESUPUESTO_FILTRO_VER_PROPIOS', 'Ver solo presupuestos propios', 'presupuesto'),
('PRESUPUESTO_FILTRO_VER_TODOS', 'Ver todos los presupuestos', 'presupuesto');
```

## Ejemplo 3: Permisos de Configuración

### Backend

#### constants/permisos.ts

```typescript
export const PERMISOS = {
  // Configuración - Equipamiento
  EQUIPAMIENTO_CONFIG: "EQUIPAMIENTO_CONFIG",
  RUTA_EQUIPAMIENTO_CONFIG: "RUTA_EQUIPAMIENTO_CONFIG",
} as const;
```

#### equipamiento-config.controller.ts

```typescript
@Controller('equipamiento/config')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoConfigController {
  @RequirePermissions(PERMISOS.EQUIPAMIENTO_CONFIG)
  @Get()
  getConfig() {
    return this.service.getConfig();
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_CONFIG)
  @Post()
  updateConfig(@Body() dto: UpdateConfigDto) {
    return this.service.updateConfig(dto);
  }
}
```

### Frontend

#### app/(admin)/config/equipamiento/page.tsx

```typescript
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import { redirect } from 'next/navigation';
import EquipamientoConfigForm from '@/components/forms/config/equipamiento-form';

export default function EquipamientoConfigPage() {
  const canAccess = hasPermission(PERMISOS.RUTA_EQUIPAMIENTO_CONFIG);

  if (!canAccess) {
    redirect('/');
  }

  return (
    <>
      <h1>Configuración de Equipamiento</h1>
      <EquipamientoConfigForm />
    </>
  );
}
```

### SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_CONFIG', 'Configuración de equipamiento', 'configuracion'),
('RUTA_EQUIPAMIENTO_CONFIG', 'Acceso a configuración de equipamiento', 'rutas');
```

## Ejemplo 4: Múltiples Permisos (OR)

### Backend

```typescript
@RequirePermissions(PERMISOS.ADMIN_GLOBAL, PERMISOS.EQUIPAMIENTO_VER)
@Get()
findAll() {
  // Usuario necesita ADMIN_GLOBAL OR EQUIPAMIENTO_VER
  return this.service.findAll();
}
```

## Ejemplo 5: Verificación Manual en Servicio

### Backend

```typescript
import { hasPermission } from '@/helpers/has-permissions.helper';
import { PERMISOS } from '@/constants/permisos';
import { UnauthorizedException } from '@nestjs/common';

async updateEstado(id: number, nuevoEstado: string) {
  // Lógica condicional según permiso
  if (nuevoEstado === 'aprobado') {
    const canApprove = await hasPermission(PERMISOS.PRESUPUESTO_APROBAR);

    if (!canApprove) {
      throw new UnauthorizedException('No tiene permiso para aprobar');
    }
  }

  return await this.repository.update(id, { estado: nuevoEstado });
}
```

## Ejemplo 6: Rutas Protegidas Frontend

### middleware.ts (si se usa)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar permisos de ruta
  const permissions = request.cookies.get('permissions')?.value || '[]';
  const userPermissions = JSON.parse(permissions);

  if (request.nextUrl.pathname.startsWith('/equipamiento')) {
    if (!userPermissions.includes('RUTA_EQUIPAMIENTO')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Constantes

```typescript
// ❌ INCORRECTO - Sin as const
export const PERMISOS = {
  X: "Y"
}

// ✅ CORRECTO - Con as const
export const PERMISOS = {
  X: "X"
} as const;
```

### Backend ≠ Frontend

```typescript
// ❌ INCORRECTO - Diferentes
// Backend
VER_PRESUPUESTOS: "VER_PRESUPUESTOS"

// Frontend
PRESUPUESTOS_VER: "PRESUPUESTOS_VER"

// ✅ CORRECTO - Idénticos
// Backend
PRESUPUESTOS_VER: "PRESUPUESTOS_VER"

// Frontend
PRESUPUESTOS_VER: "PRESUPUESTOS_VER"
```

### Guards

```typescript
// ❌ INCORRECTO - Sin guards
@Controller('equipamiento')
export class EquipamientoController {
  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get()
  findAll() { }
}

// ✅ CORRECTO - Con guards
@Controller('equipamiento')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoController {
  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get()
  findAll() { }
}
```

### Hardcodear Strings

```typescript
// ❌ INCORRECTO
if (hasPermission("EQUIPAMIENTO_VER"))

// ✅ CORRECTO
if (hasPermission(PERMISOS.EQUIPAMIENTO_VER))
```

### SQL

```typescript
// ❌ INCORRECTO - Asignar a roles
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');

INSERT INTO role_permissions (role_id, permission_id) VALUES (1, LAST_INSERT_ID());

// ✅ CORRECTO - Solo permisos
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');
```

## Resumen de Casos de Uso

| Caso | Permisos | Uso |
|------|----------|-----|
| CRUD básico | VER, CREAR, EDITAR, ELIMINAR | Endpoints estándar |
| Filtros visibilidad | FILTRO_VER_PROPIOS, FILTRO_VER_TODOS | Limitar datos por usuario |
| Configuración | CONFIG, RUTA_CONFIG | Páginas de configuración |
| Exportar | EXPORTAR_PDF, EXPORTAR_EXCEL | Botones de exportación |
| Aprobar | APROBAR | Workflow de aprobación |
| Rutas | RUTA_MODULO | Acceso a páginas |
