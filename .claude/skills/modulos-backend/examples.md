# Módulos Backend - Ejemplos

Ejemplos completos de módulos NestJS + TypeORM del proyecto.

## Ejemplo 1: Equipamiento

### Entidad

```typescript
// packages/api/src/modules/equipamiento/entities/equipamiento.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { EquipamientoTipo } from '@/modules/equipamiento-tipo/entities/equipamiento-tipo.entity';
import { JornadaEquipamiento } from '@/modules/jornada/entities/jornada-equipamiento.entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Entity({ name: 'equipamiento' })
export class Equipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ name: 'tipo_id', type: 'int', nullable: true })
  tipoId: number;

  @ManyToOne(() => EquipamientoTipo, tipo => tipo.equipamientos, { nullable: true })
  @JoinColumn({ name: 'tipo_id' })
  tipo?: EquipamientoTipo;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  patente: string;

  @Column({ name: 'numero_serie', type: 'varchar', length: 100, nullable: true })
  numeroSerie: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vin: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  anio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kilometraje: string;

  @Column({ name: 'capacidad_kg', type: 'varchar', length: 100, nullable: true })
  capacidadKg: string;

  @Column({ name: 'capacidad_izaje', type: 'varchar', length: 100, nullable: true })
  capacidadIzaje: string;

  @Column({ name: 'cantidad_ejes', type: 'varchar', length: 100, nullable: true })
  cantidadEjes: string;

  @Column({ name: 'cantidad_auxilio', type: 'varchar', length: 100, nullable: true })
  cantidadAuxilio: string;

  @Column({ name: 'horas_uso', type: 'varchar', length: 100, nullable: true })
  horasUso: string;

  @Column({ name: 'hs_marcha', type: 'varchar', length: 100, nullable: true })
  hsMarcha: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  litros: string;

  @Column({ name: 'presion_bar', type: 'varchar', length: 100, nullable: true })
  presionBar: string;

  @OneToMany(() => JornadaEquipamiento, je => je.equipamiento)
  jornadaEquipamientos?: JornadaEquipamiento[];

  // Campo virtual para archivos (cargado en servicio)
  adjuntos?: Archivo[];
}
```

### Servicio

```typescript
// packages/api/src/modules/equipamiento/equipamiento.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/transform-to-generic-filters';
import { Equipamiento } from './entities/equipamiento.entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';
import { CreateEquipamientoDto } from './dto/create-equipamiento.dto';
import { UpdateEquipamientoDto } from './dto/update-equipamiento.dto';

@Injectable()
export class EquipamientoService {
  constructor(
    @InjectRepository(Equipamiento)
    private equipamientoRepository: Repository<Equipamiento>,
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>
  ) {}

  async findAll(conditions: FindManyOptions<Equipamiento>) {
    return await this.equipamientoRepository.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where),
      relations: ['tipo'],
    });
  }

  async findOne(id: number) {
    const equipamiento = await this.equipamientoRepository.findOne({
      where: { id },
      relations: ['tipo'],
    });

    if (equipamiento) {
      // Cargar archivos asociados
      equipamiento.adjuntos = await this.archivoRepository.find({
        where: {
          modelo: 'equipamiento',
          modeloId: id,
          tipo: 'adjunto',
        },
      });
    }

    return equipamiento;
  }

  async create(dto: CreateEquipamientoDto) {
    return await this.equipamientoRepository.save(dto);
  }

  async update(id: number, dto: UpdateEquipamientoDto) {
    await this.equipamientoRepository.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const equipamiento = await this.findOne(id);
    await this.equipamientoRepository.delete({ id });
    return equipamiento;
  }
}
```

### Controlador

```typescript
// packages/api/src/modules/equipamiento/equipamiento.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { EquipamientoService } from './equipamiento.service';
import { CreateEquipamientoDto } from './dto/create-equipamiento.dto';
import { UpdateEquipamientoDto } from './dto/update-equipamiento.dto';

@Controller('equipamiento')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoController {
  constructor(private readonly equipamientoService: EquipamientoService) {}

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.equipamientoService.findAll({ where, order: orderBy, take, skip });
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipamientoService.findOne(id);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_CREAR)
  @Post()
  create(@Body() dto: CreateEquipamientoDto) {
    return this.equipamientoService.create(dto);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipamientoDto) {
    return this.equipamientoService.update(id, dto);
  }

  @RequirePermissions(PERMISOS.EQUIPAMIENTO_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipamientoService.remove(id);
  }
}
```

### DTO

```typescript
// packages/api/src/modules/equipamiento/dto/create-equipamiento.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEquipamientoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsNumber()
  tipoId?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  patente?: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  anio?: string;

  @IsOptional()
  @IsString()
  kilometraje?: string;

  @IsOptional()
  @IsString()
  capacidadKg?: string;

  @IsOptional()
  @IsString()
  capacidadIzaje?: string;

  @IsOptional()
  @IsString()
  cantidadEjes?: string;

  @IsOptional()
  @IsString()
  cantidadAuxilio?: string;

  @IsOptional()
  @IsString()
  horasUso?: string;

  @IsOptional()
  @IsString()
  hsMarcha?: string;

  @IsOptional()
  @IsString()
  litros?: string;

  @IsOptional()
  @IsString()
  presionBar?: string;
}
```

### Módulo

```typescript
// packages/api/src/modules/equipamiento/equipamiento.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipamientoService } from './equipamiento.service';
import { EquipamientoController } from './equipamiento.controller';
import { Equipamiento } from './entities/equipamiento.entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipamiento,
      Archivo,  // Para cargar archivos asociados
    ]),
  ],
  controllers: [EquipamientoController],
  providers: [EquipamientoService],
  exports: [EquipamientoService],
})
export class EquipamientoModule {}
```

### Permisos

```typescript
// packages/api/src/constants/permisos.ts (y frontend idéntico)
export const PERMISOS = {
  // CRUD - Equipamiento
  EQUIPAMIENTO_VER: "EQUIPAMIENTO_VER",
  EQUIPAMIENTO_CREAR: "EQUIPAMIENTO_CREAR",
  EQUIPAMIENTO_EDITAR: "EQUIPAMIENTO_EDITAR",
  EQUIPAMIENTO_ELIMINAR: "EQUIPAMIENTO_ELIMINAR",

  // Rutas del menú - Equipamiento
  RUTA_EQUIPAMIENTO: "RUTA_EQUIPAMIENTO",
} as const;
```

### Migración SQL

```sql
-- packages/api/sql/75.sql
CREATE TABLE IF NOT EXISTS `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `tipo_id` INT NULL,
  `descripcion` VARCHAR(500) NULL,
  `modelo` VARCHAR(100) NULL,
  `marca` VARCHAR(100) NULL,
  `patente` VARCHAR(100) NULL,
  `numero_serie` VARCHAR(100) NULL,
  `vin` VARCHAR(100) NULL,
  `anio` VARCHAR(100) NULL,
  `kilometraje` VARCHAR(100) NULL,
  `capacidad_kg` VARCHAR(100) NULL,
  `capacidad_izaje` VARCHAR(100) NULL,
  `cantidad_ejes` VARCHAR(100) NULL,
  `cantidad_auxilio` VARCHAR(100) NULL,
  `horas_uso` VARCHAR(100) NULL,
  `hs_marcha` VARCHAR(100) NULL,
  `litros` VARCHAR(100) NULL,
  `presion_bar` VARCHAR(100) NULL,

  -- Campos BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),
  CONSTRAINT `FK_equipamiento_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `equipamiento_tipo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX `IDX_equipamiento_tipo_id` ON `equipamiento`(`tipo_id`);
CREATE INDEX `IDX_equipamiento_patente` ON `equipamiento`(`patente`);
CREATE INDEX `IDX_equipamiento_vin` ON `equipamiento`(`vin`);

-- Permisos
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento'),
('EQUIPAMIENTO_CREAR', 'Crear equipamiento', 'equipamiento'),
('EQUIPAMIENTO_EDITAR', 'Editar equipamiento', 'equipamiento'),
('EQUIPAMIENTO_ELIMINAR', 'Eliminar equipamiento', 'equipamiento'),
('RUTA_EQUIPAMIENTO', 'Acceso a página equipamiento', 'rutas');
```

---

## Ejemplo 2: Jornada (Relaciones)

### Entidad con Relaciones

```typescript
// packages/api/src/modules/jornada/entities/jornada.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { Presupuesto } from '@/modules/presupuesto/entities/presupuesto.entity';
import { JornadaPersona } from './jornada-persona.entity';
import { JornadaEquipamiento } from './jornada-equipamiento.entity';

@Entity({ name: 'jornada' })
export class Jornada extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fecha: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  detalle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  anotaciones: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  cancelado: number;

  @Column({ name: 'motivo_cancelacion', type: 'varchar', length: 500, nullable: true })
  motivoCancelacion: string;

  @Column({ name: 'presupuesto_id', type: 'int', nullable: true })
  presupuestoId: number;

  @ManyToOne(() => Presupuesto, { nullable: true })
  @JoinColumn({ name: 'presupuesto_id' })
  presupuesto?: Presupuesto;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo: string;

  @OneToMany(() => JornadaPersona, jp => jp.jornada)
  jornadaPersonas?: JornadaPersona[];

  @OneToMany(() => JornadaEquipamiento, je => je.jornada)
  jornadaEquipamientos?: JornadaEquipamiento[];
}
```

### Servicio con Relaciones

```typescript
// packages/api/src/modules/jornada/jornada.service.ts
async findOne(id: number) {
  return await this.jornadaRepository.findOne({
    where: { id },
    relations: [
      'presupuesto',
      'presupuesto.cliente',
      'jornadaPersonas',
      'jornadaPersonas.persona',
      'jornadaPersonas.produccionTrabajo',
      'jornadaEquipamientos',
      'jornadaEquipamientos.equipamiento',
      'jornadaEquipamientos.equipamiento.tipo',
      'jornadaEquipamientos.personaResponsable',
    ],
  });
}
```

---

## Comparación ❌/✅

### Entidad

```typescript
// ❌ Incorrecto
import { BaseEntity } from 'typeorm';

@Entity()  // Sin nombre de tabla
export class Equipamiento extends BaseEntity {
  @Column()  // Sin name ni type
  anioFabricacion: string;

  @Column({ type: 'int' })  // Sin name
  tipoId: number;
}

// ✅ Correcto
import { BaseEntity } from '@/common/base.entity';

@Entity({ name: 'equipamiento' })
export class Equipamiento extends BaseEntity {
  @Column({ name: 'anio_fabricacion', type: 'varchar', length: 100, nullable: true })
  anioFabricacion: string;

  @Column({ name: 'tipo_id', type: 'int', nullable: true })
  tipoId: number;
}
```

### Servicio

```typescript
// ❌ Incorrecto
async findAll() {
  return await this.repo.find();  // Sin parámetros
}

async create(dto: CreateDto) {
  const entity = this.repo.create(dto);
  return await this.repo.save(entity);
}

async remove(id: number) {
  return await this.repo.softDelete({ id });
}

// ✅ Correcto
async findAll(conditions: FindManyOptions<Entidad>) {
  return await this.repo.find({
    ...conditions,
    where: transformToGenericFilters(conditions.where),
  });
}

async create(dto: CreateDto) {
  return await this.repo.save(dto);
}

async remove(id: number) {
  const entity = await this.findOne(id);
  await this.repo.delete({ id });
  return entity;
}
```

### Controlador

```typescript
// ❌ Incorrecto
@Controller('equipamiento')  // Sin guards
export class EquipamientoController {
  @Get(':id')  // Sin @RequirePermissions
  findOne(@Param('id') id: string) {  // String, no ParseIntPipe
    return this.service.findOne(Number(id));
  }
}

// ✅ Correcto
@Controller('equipamiento')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EquipamientoController {
  @RequirePermissions(PERMISOS.EQUIPAMIENTO_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
```
