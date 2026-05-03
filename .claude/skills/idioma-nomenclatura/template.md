# Template: Nueva Entidad con Nomenclatura Correcta

Este template muestra cómo crear una nueva entidad siguiendo todas las convenciones de nomenclatura.

**Variables a reemplazar:**
- `[Entidad]` - Nombre PascalCase (ej: ProcesoGeneral)
- `[entidad]` - Nombre kebab-case para archivos (ej: proceso-general)
- `[entidad_tabla]` - Nombre snake_case para tabla (ej: proceso_general)

## Backend

### 1. Entidad

**Ubicación:** `packages/api/src/modules/[entidad]/entities/[entidad].entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('[entidad_tabla]')  // ✅ snake_case
export class [Entidad] extends BaseEntity {  // ✅ PascalCase
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'nombre' })  // ✅ snake_case con name
  nombre: string;  // ✅ camelCase

  @Column({ type: 'varchar', length: 100, name: 'fecha_inicio', nullable: true })
  fechaInicio?: string;

  @Column({ type: 'int', name: 'categoria_id', nullable: true })  // ✅ FK con _id
  categoriaId?: number;

  @ManyToOne(() => Categoria, (cat) => cat.[entidad]s)
  @JoinColumn({ name: 'categoria_id' })
  categoria?: Categoria;
}
```

### 2. DTO Crear

**Ubicación:** `packages/api/src/modules/[entidad]/dto/crear-[entidad].dto.ts`

```typescript
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class Crear[Entidad]Dto {  // ✅ PascalCase
  @IsString()
  nombre: string;  // ✅ camelCase

  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsNumber()
  categoriaId?: number;
}
```

### 3. DTO Actualizar

**Ubicación:** `packages/api/src/modules/[entidad]/dto/actualizar-[entidad].dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Crear[Entidad]Dto } from './crear-[entidad].dto';

export class Actualizar[Entidad]Dto extends PartialType(Crear[Entidad]Dto) {}  // ✅ PascalCase
```

### 4. Servicio

**Ubicación:** `packages/api/src/modules/[entidad]/[entidad].service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [Entidad] } from './entities/[entidad].entity';
import { Crear[Entidad]Dto } from './dto/crear-[entidad].dto';
import { Actualizar[Entidad]Dto } from './dto/actualizar-[entidad].dto';

@Injectable()
export class [Entidad]Service {  // ✅ PascalCase
  constructor(
    @InjectRepository([Entidad])
    private [entidad]Repository: Repository<[Entidad]>,  // ✅ camelCase
  ) {}

  async crear(dto: Crear[Entidad]Dto) {  // ✅ camelCase español
    return await this.[entidad]Repository.save(dto);
  }

  async encontrarTodos() {  // ✅ camelCase español
    return await this.[entidad]Repository.find();
  }

  async encontrarPorId(id: number) {  // ✅ camelCase español
    const [entidad] = await this.[entidad]Repository.findOne({
      where: { id },
      relations: ['categoria'],
    });

    if (![entidad]) {
      throw new NotFoundException(`[Entidad] con ID ${id} no encontrado`);
    }

    return [entidad];
  }

  async actualizar(id: number, dto: Actualizar[Entidad]Dto) {  // ✅ camelCase español
    await this.encontrarPorId(id);
    return await this.[entidad]Repository.save({ id, ...dto });
  }

  async eliminar(id: number) {  // ✅ camelCase español
    await this.encontrarPorId(id);
    await this.[entidad]Repository.softDelete(id);
  }
}
```

### 5. Controlador

**Ubicación:** `packages/api/src/modules/[entidad]/[entidad].controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { [Entidad]Service } from './[entidad].service';
import { Crear[Entidad]Dto } from './dto/crear-[entidad].dto';
import { Actualizar[Entidad]Dto } from './dto/actualizar-[entidad].dto';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';

@Controller('[entidad]')  // ✅ kebab-case
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class [Entidad]Controller {  // ✅ PascalCase
  constructor(private readonly [entidad]Service: [Entidad]Service) {}  // ✅ camelCase

  @RequirePermissions(PERMISOS.[ENTIDAD]_VER)
  @Get()
  encontrarTodos() {  // ✅ camelCase español
    return this.[entidad]Service.encontrarTodos();
  }

  @RequirePermissions(PERMISOS.[ENTIDAD]_VER)
  @Get(':id')
  encontrarPorId(@Param('id', ParseIntPipe) id: number) {  // ✅ camelCase español
    return this.[entidad]Service.encontrarPorId(id);
  }

  @RequirePermissions(PERMISOS.[ENTIDAD]_CREAR)
  @Post()
  crear(@Body() dto: Crear[Entidad]Dto) {  // ✅ camelCase español
    return this.[entidad]Service.crear(dto);
  }

  @RequirePermissions(PERMISOS.[ENTIDAD]_EDITAR)
  @Patch(':id')
  actualizar(  // ✅ camelCase español
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Actualizar[Entidad]Dto
  ) {
    return this.[entidad]Service.actualizar(id, dto);
  }

  @RequirePermissions(PERMISOS.[ENTIDAD]_ELIMINAR)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {  // ✅ camelCase español
    return this.[entidad]Service.eliminar(id);
  }
}
```

### 6. Módulo

**Ubicación:** `packages/api/src/modules/[entidad]/[entidad].module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { [Entidad]Service } from './[entidad].service';
import { [Entidad]Controller } from './[entidad].controller';
import { [Entidad] } from './entities/[entidad].entity';

@Module({
  imports: [TypeOrmModule.forFeature([[Entidad]])],
  controllers: [[Entidad]Controller],
  providers: [[Entidad]Service],
  exports: [[Entidad]Service],
})
export class [Entidad]Module {}  // ✅ PascalCase
```

### 7. Migración SQL

**Ubicación:** `packages/api/sql/[numero].sql`

```sql
CREATE TABLE IF NOT EXISTS `[entidad_tabla]` (  -- ✅ snake_case
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `fecha_inicio` VARCHAR(100) NULL,  -- ✅ snake_case
  `categoria_id` INT NULL,  -- ✅ FK con _id
  -- Campos de BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_[entidad_tabla]_categoria`
    FOREIGN KEY (`categoria_id`) REFERENCES `categoria`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices
CREATE INDEX `IDX_[entidad_tabla]_categoria_id` ON `[entidad_tabla]`(`categoria_id`);
CREATE INDEX `IDX_[entidad_tabla]_nombre` ON `[entidad_tabla]`(`nombre`);
```

## Frontend

### 1. Type

**Ubicación:** `packages/front/src/types/index.d.ts`

```typescript
export type [Entidad] = {  // ✅ PascalCase
  id?: number;
  nombre: string;  // ✅ camelCase
  fechaInicio?: string;
  categoriaId?: number;
}
```

### 2. Servicio

**Ubicación:** `packages/front/src/services/[entidad].ts`

```typescript
import { [Entidad], Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = '[entidad]';  // ✅ kebab-case

const fetch = async (query: Query): Promise<[Entidad][]> => {  // ✅ camelCase
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

### 3. Hook

**Ubicación:** `packages/front/src/hooks/[entidad].tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [Entidad], Query } from '@/types';
import * as [entidad]Service from '@/services/[entidad]';  // ✅ camelCase

export const useGet[Entidad]sQuery = (query: Query) => {  // ✅ PascalCase
  return useQuery({
    queryKey: ['[entidad]s', query],  // ✅ kebab-case
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

### 4. Formulario

**Archivo:** `[entidad]-form.tsx` (✅ kebab-case)
**Ubicación:** `packages/front/src/components/forms/[entidad]-form.tsx`

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({  // ✅ camelCase
  nombre: z.string().min(1),
  fechaInicio: z.string().optional(),
  categoriaId: z.number().optional(),
});

export default function [Entidad]Form({ datos }: { datos?: [Entidad] }) {  // ✅ PascalCase
  const formulario = useForm<z.infer<typeof formSchema>>({  // ✅ camelCase
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: datos?.nombre || "",
      fechaInicio: datos?.fechaInicio,
      categoriaId: datos?.categoriaId,
    }
  })

  async function manejarEnvio(valores: z.infer<typeof formSchema>) {  // ✅ camelCase español
    // Lógica de envío
  }

  return (
    <form onSubmit={formulario.handleSubmit(manejarEnvio)}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## Checklist de Nomenclatura

### Backend:
- [ ] Tabla en snake_case: `[entidad_tabla]`
- [ ] Clase en PascalCase: `[Entidad]`
- [ ] Columnas BD con `name` en snake_case
- [ ] FKs con sufijo `_id`
- [ ] Variables/funciones en camelCase español
- [ ] Archivos en kebab-case: `[entidad].service.ts`
- [ ] DTOs en PascalCase: `Crear[Entidad]Dto`

### Frontend:
- [ ] Type en PascalCase: `[Entidad]`
- [ ] Archivos en kebab-case: `[entidad].ts`, `[entidad]-form.tsx`
- [ ] Variables/funciones en camelCase español
- [ ] Component en PascalCase: `[Entidad]Form`
- [ ] Hooks en PascalCase: `useGet[Entidad]sQuery`
- [ ] QueryKeys en kebab-case: `'[entidad]s'`

### General:
- [ ] Todo en español excepto términos técnicos
- [ ] Comentarios en español
- [ ] Mensajes en español

## Notas

- ⚠️ **SIEMPRE** especificar `name` en columnas BD
- ✅ Archivos componentes React: kebab-case, NO PascalCase
- ✅ FKs siempre con sufijo `_id`
- ✅ Funciones/métodos en español: `crearEquipamiento`, no `createEquipment`
