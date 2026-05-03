# Template - Sistema de Permisos

Plantillas para implementar permisos RBAC. Reemplazar placeholders según el módulo.

## Placeholders

- `[MODULO]` → Nombre en UPPER_SNAKE_CASE (ej: `EQUIPAMIENTO`, `PROVEEDOR`)
- `[Modulo]` → Nombre en PascalCase (ej: `Equipamiento`, `Proveedor`)
- `[modulo]` → Nombre en kebab-case (ej: `equipamiento`, `proveedor`)
- `[modulo_snake]` → Nombre en snake_case (ej: `equipamiento`, `proceso_general`)

---

## Template - Constantes Backend

```typescript
// packages/api/src/constants/permisos.ts
export const PERMISOS = {
  // [MODULO] - CRUD
  [MODULO]_VER: "[MODULO]_VER",
  [MODULO]_CREAR: "[MODULO]_CREAR",
  [MODULO]_EDITAR: "[MODULO]_EDITAR",
  [MODULO]_ELIMINAR: "[MODULO]_ELIMINAR",

  // [MODULO] - Filtros
  [MODULO]_FILTRO_VER_PROPIOS: "[MODULO]_FILTRO_VER_PROPIOS",
  [MODULO]_FILTRO_VER_TODOS: "[MODULO]_FILTRO_VER_TODOS",

  // [MODULO] - Rutas
  RUTA_[MODULO]: "RUTA_[MODULO]",

  // [MODULO] - Acciones específicas
  [MODULO]_EXPORTAR_PDF: "[MODULO]_EXPORTAR_PDF",
  [MODULO]_EXPORTAR_EXCEL: "[MODULO]_EXPORTAR_EXCEL",
} as const;
```

---

## Template - Constantes Frontend (IDÉNTICO)

```typescript
// packages/front/src/constants/permisos.ts
export const PERMISOS = {
  // [MODULO] - CRUD
  [MODULO]_VER: "[MODULO]_VER",
  [MODULO]_CREAR: "[MODULO]_CREAR",
  [MODULO]_EDITAR: "[MODULO]_EDITAR",
  [MODULO]_ELIMINAR: "[MODULO]_ELIMINAR",

  // [MODULO] - Filtros
  [MODULO]_FILTRO_VER_PROPIOS: "[MODULO]_FILTRO_VER_PROPIOS",
  [MODULO]_FILTRO_VER_TODOS: "[MODULO]_FILTRO_VER_TODOS",

  // [MODULO] - Rutas
  RUTA_[MODULO]: "RUTA_[MODULO]",

  // [MODULO] - Acciones específicas
  [MODULO]_EXPORTAR_PDF: "[MODULO]_EXPORTAR_PDF",
  [MODULO]_EXPORTAR_EXCEL: "[MODULO]_EXPORTAR_EXCEL",
} as const;
```

---

## Template - Controlador Backend

```typescript
// packages/api/src/modules/[modulo]/[modulo].controller.ts
import { Controller, Get, Post, Patch, Delete, UseGuards, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { [Modulo]Service } from './[modulo].service';

@Controller('[modulo]')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class [Modulo]Controller {
  constructor(private readonly service: [Modulo]Service) {}

  @RequirePermissions(PERMISOS.[MODULO]_VER)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions(PERMISOS.[MODULO]_VER)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @RequirePermissions(PERMISOS.[MODULO]_CREAR)
  @Post()
  create(@Body() dto: Create[Modulo]Dto) {
    return this.service.create(dto);
  }

  @RequirePermissions(PERMISOS.[MODULO]_EDITAR)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: Update[Modulo]Dto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.[MODULO]_ELIMINAR)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
```

---

## Template - Servicio con Filtros

```typescript
// packages/api/src/modules/[modulo]/[modulo].service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [Modulo] } from './entities/[modulo].entity';
import { hasPermission } from '@/helpers/has-permissions.helper';
import { getUser } from '@/helpers/get-user';
import { PERMISOS } from '@/constants/permisos';

@Injectable()
export class [Modulo]Service {
  constructor(
    @InjectRepository([Modulo])
    private repository: Repository<[Modulo]>,
  ) {}

  async findAll() {
    const canViewAll = await hasPermission(PERMISOS.[MODULO]_FILTRO_VER_TODOS);

    if (canViewAll) {
      // Ver todos
      return await this.repository.find();
    } else {
      // Ver solo propios
      const user = getUser();
      return await this.repository.find({
        where: { createdBy: user.id }
      });
    }
  }
}
```

---

## Template - Frontend Listado

```typescript
// packages/front/src/app/(admin)/[modulo]/page.tsx
"use client";
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';
import [Modulo]Table from '@/components/tables/[modulo]-table';

export default function [Modulo]List() {
  const canCreate = hasPermission(PERMISOS.[MODULO]_CREAR);
  const canExport = hasPermission(PERMISOS.[MODULO]_EXPORTAR_EXCEL);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1>[Modulo]</h1>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          )}
          {canCreate && (
            <Link href="/[modulo]/crear">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear
              </Button>
            </Link>
          )}
        </div>
      </div>
      <[Modulo]Table />
    </>
  );
}
```

---

## Template - Frontend Formulario

```typescript
// packages/front/src/components/forms/[modulo]-form.tsx
"use client";
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function [Modulo]Form({ data }) {
  const canEdit = hasPermission(PERMISOS.[MODULO]_EDITAR);
  const canDelete = hasPermission(PERMISOS.[MODULO]_ELIMINAR);

  return (
    <form>
      {/* Campos del formulario */}

      <div className="flex justify-between">
        {data?.id && canDelete && (
          <Button variant="destructive" type="button">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        )}
        {canEdit && (
          <Button type="submit">Guardar</Button>
        )}
      </div>
    </form>
  );
}
```

---

## Template - SQL Migration

```sql
-- Migración: Permisos [MODULO]

-- CRUD
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('[MODULO]_VER', 'Ver [modulo]', '[modulo_snake]'),
('[MODULO]_CREAR', 'Crear [modulo]', '[modulo_snake]'),
('[MODULO]_EDITAR', 'Editar [modulo]', '[modulo_snake]'),
('[MODULO]_ELIMINAR', 'Eliminar [modulo]', '[modulo_snake]');

-- Filtros
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('[MODULO]_FILTRO_VER_PROPIOS', 'Ver solo [modulo] propios', '[modulo_snake]'),
('[MODULO]_FILTRO_VER_TODOS', 'Ver todos los [modulo]', '[modulo_snake]');

-- Rutas
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_[MODULO]', 'Acceso a página de [modulo]', 'rutas');

-- Acciones específicas
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('[MODULO]_EXPORTAR_PDF', 'Exportar [modulo] a PDF', '[modulo_snake]'),
('[MODULO]_EXPORTAR_EXCEL', 'Exportar [modulo] a Excel', '[modulo_snake]');
```

---

## Ejemplo de Reemplazo: Equipamiento

```typescript
// Reemplazos:
[MODULO] → EQUIPAMIENTO
[Modulo] → Equipamiento
[modulo] → equipamiento
[modulo_snake] → equipamiento

// Resultado Backend:
export const PERMISOS = {
  EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
  EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
  EQUIPAMIENTO_EDITAR: "EQUIPAMIENTO_EDITAR",
  EQUIPAMIENTO_ELIMINAR: "EQUIPAMIENTO_ELIMINAR",
  RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",
} as const;

// Resultado Controlador:
@Controller('equipamiento')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoController {
  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get()
  findAll() { }
}

// Resultado Frontend:
const canCreate = hasPermission(PERMISOS.EQUIPAMIENTO_CREAR);

// Resultado SQL:
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');
```

---

## Ejemplo de Reemplazo: Proceso General

```typescript
// Reemplazos:
[MODULO] → PROCESO_GENERAL
[Modulo] → ProcesoGeneral
[modulo] → proceso-general
[modulo_snake] → proceso_general

// Resultado:
export const PERMISOS = {
  PROCESO_GENERAL_VER: "PROCESO_GENERAL_VER",
  PROCESO_GENERAL_CREAR: "PROCESO_GENERAL_CREAR",
  RUTA_PROCESO_GENERAL: "RUTA_PROCESO_GENERAL",
} as const;

// SQL:
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('PROCESO_GENERAL_VER', 'Ver proceso general', 'proceso_general');
```

---

## Checklist de Reemplazo

- [ ] Reemplazar `[MODULO]` en UPPER_SNAKE_CASE
- [ ] Reemplazar `[Modulo]` en PascalCase
- [ ] Reemplazar `[modulo]` en kebab-case
- [ ] Reemplazar `[modulo_snake]` en snake_case
- [ ] Verificar constantes backend
- [ ] Verificar constantes frontend (IDÉNTICAS)
- [ ] Agregar `as const` al final
- [ ] Verificar guards en controlador
- [ ] Verificar `@RequirePermissions` en endpoints
- [ ] Verificar SQL INSERT permissions
- [ ] NO asignar a roles en SQL

---

## Resumen de Nomenclatura

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| CRUD | `[MODULO]_<ACCION>` | `EQUIPAMIENTO_VER` |
| Filtros | `[MODULO]_FILTRO_<DESC>` | `EQUIPAMIENTO_FILTRO_VER_PROPIOS` |
| Rutas | `RUTA_[MODULO]` | `RUTA_EQUIPAMIENTO` |
| Config | `[MODULO]_CONFIG` | `EQUIPAMIENTO_CONFIG` |
| Exportar | `[MODULO]_EXPORTAR_<FORMATO>` | `EQUIPAMIENTO_EXPORTAR_PDF` |
| Aprobar | `[MODULO]_APROBAR` | `PRESUPUESTO_APROBAR` |
