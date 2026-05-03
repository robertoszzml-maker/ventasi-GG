# Template: Módulo Backend

Template base para crear un módulo NestJS + TypeORM completo.

## Migración SQL

```sql
-- Migración: XX.sql
-- Descripción: Crear tabla <nombre_entidad>

CREATE TABLE IF NOT EXISTS `<nombre_tabla>` (
  `id` INT NOT NULL AUTO_INCREMENT,

  -- Campos de negocio
  `nombre` VARCHAR(255) NOT NULL,
  `<campo_fk>_id` INT NULL,
  `<campo_varchar>` VARCHAR(100) NULL,
  `<campo_texto>` VARCHAR(500) NULL,

  -- Campos BaseEntity (OBLIGATORIOS)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  -- Foreign Keys
  CONSTRAINT `FK_<tabla>_<campo_fk>` FOREIGN KEY (`<campo_fk>_id`)
    REFERENCES `<tabla_referenciada>`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- Índices
CREATE INDEX `IDX_<tabla>_<campo_fk>_id` ON `<nombre_tabla>`(`<campo_fk>_id`);
CREATE INDEX `IDX_<tabla>_<campo_busqueda>` ON `<nombre_tabla>`(`<campo_busqueda>`);

-- Permisos
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('<ENTIDAD>_VER', 'Ver <entidad>', '<modulo>'),
('<ENTIDAD>_CREAR', 'Crear <entidad>', '<modulo>'),
('<ENTIDAD>_EDITAR', 'Editar <entidad>', '<modulo>'),
('<ENTIDAD>_ELIMINAR', 'Eliminar <entidad>', '<modulo>'),
('RUTA_<ENTIDAD>', 'Acceso a página <entidad>', 'rutas');
```

---

## Entidad

```typescript
// packages/api/src/modules/<nombre>/entities/<nombre>.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { <EntidadRelacionada> } from '@/modules/<modulo>/entities/<entidad>.entity';

@Entity({ name: '<nombre_tabla>' })
export class <Entidad> extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  // Foreign Key
  @Column({ name: '<campo>_id', type: 'int', nullable: true })
  <campo>Id: number;

  @ManyToOne(() => <EntidadRelacionada>, { nullable: true })
  @JoinColumn({ name: '<campo>_id' })
  <campo>?: <EntidadRelacionada>;

  // Campos VARCHAR (valores de negocio)
  @Column({ name: '<campo_snake>', type: 'varchar', length: 100, nullable: true })
  <campoCamel>: string;

  // Relaciones inversas
  @OneToMany(() => <EntidadHija>, hija => hija.<entidadPadre>)
  <entidadesHijas>?: <EntidadHija>[];
}
```

---

## DTO

```typescript
// packages/api/src/modules/<nombre>/dto/create-<nombre>.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class Create<Entidad>Dto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsNumber()
  <campo>Id?: number;

  @IsOptional()
  @IsString()
  <campo>?: string;
}
```

---

## Servicio

```typescript
// packages/api/src/modules/<nombre>/<nombre>.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/transform-to-generic-filters';
import { <Entidad> } from './entities/<nombre>.entity';
import { Create<Entidad>Dto } from './dto/create-<nombre>.dto';
import { Update<Entidad>Dto } from './dto/update-<nombre>.dto';

@Injectable()
export class <Entidad>Service {
  constructor(
    @InjectRepository(<Entidad>)
    private repository: Repository<<Entidad>>
  ) {}

  async findAll(conditions: FindManyOptions<<Entidad>>) {
    return await this.repository.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where),
      relations: ['<relacion>'],
    });
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: ['<relacion>'],
    });
  }

  async create(dto: Create<Entidad>Dto) {
    return await this.repository.save(dto);
  }

  async update(id: number, dto: Update<Entidad>Dto) {
    await this.repository.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repository.delete({ id });
    return entity;
  }
}
```

---

## Controlador

```typescript
// packages/api/src/modules/<nombre>/<nombre>.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { <Entidad>Service } from './<nombre>.service';
import { Create<Entidad>Dto } from './dto/create-<nombre>.dto';
import { Update<Entidad>Dto } from './dto/update-<nombre>.dto';

@Controller('<nombre-kebab>')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class <Entidad>Controller {
  constructor(private readonly service: <Entidad>Service) {}

  @RequirePermissions(PERMISOS.<ENTIDAD>_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.service.findAll({ where, order: orderBy, take, skip });
  }

  @RequirePermissions(PERMISOS.<ENTIDAD>_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @RequirePermissions(PERMISOS.<ENTIDAD>_CREAR)
  @Post()
  create(@Body() dto: Create<Entidad>Dto) {
    return this.service.create(dto);
  }

  @RequirePermissions(PERMISOS.<ENTIDAD>_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Update<Entidad>Dto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.<ENTIDAD>_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

---

## Módulo

```typescript
// packages/api/src/modules/<nombre>/<nombre>.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <Entidad>Service } from './<nombre>.service';
import { <Entidad>Controller } from './<nombre>.controller';
import { <Entidad> } from './entities/<nombre>.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      <Entidad>,
    ]),
  ],
  controllers: [<Entidad>Controller],
  providers: [<Entidad>Service],
  exports: [<Entidad>Service],
})
export class <Entidad>Module {}
```

---

## Permisos

### Backend

```typescript
// packages/api/src/constants/permisos.ts
export const PERMISOS = {
  // CRUD - <Entidad>
  <ENTIDAD>_VER: "<ENTIDAD>_VER",
  <ENTIDAD>_CREAR: "<ENTIDAD>_CREAR",
  <ENTIDAD>_EDITAR: "<ENTIDAD>_EDITAR",
  <ENTIDAD>_ELIMINAR: "<ENTIDAD>_ELIMINAR",

  // Rutas del menú - <Entidad>
  RUTA_<ENTIDAD>: "RUTA_<ENTIDAD>",
} as const;
```

### Frontend (IDÉNTICO)

```typescript
// packages/front/src/constants/permisos.ts
export const PERMISOS = {
  // CRUD - <Entidad>
  <ENTIDAD>_VER: "<ENTIDAD>_VER",
  <ENTIDAD>_CREAR: "<ENTIDAD>_CREAR",
  <ENTIDAD>_EDITAR: "<ENTIDAD>_EDITAR",
  <ENTIDAD>_ELIMINAR: "<ENTIDAD>_ELIMINAR",

  // Rutas del menú - <Entidad>
  RUTA_<ENTIDAD>: "RUTA_<ENTIDAD>",
} as const;
```

---

## Placeholders

Reemplazar en template:

- `<nombre>`: nombre del módulo (kebab-case) → `equipamiento`
- `<Entidad>`: nombre de la clase (PascalCase) → `Equipamiento`
- `<ENTIDAD>`: constante permisos (UPPER_SNAKE_CASE) → `EQUIPAMIENTO`
- `<nombre_tabla>`: nombre tabla BD (snake_case) → `equipamiento`
- `<campo>`: nombre campo (camelCase/snake_case según contexto)
- `<modulo>`: nombre módulo para SQL → `equipamiento`
