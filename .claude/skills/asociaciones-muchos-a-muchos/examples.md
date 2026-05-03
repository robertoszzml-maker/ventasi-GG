# Ejemplos: Asociaciones Muchos-a-Muchos

## Ejemplo Completo: Jornada ↔ Equipamiento

Este ejemplo muestra la implementación completa de una relación M:N entre Jornada y Equipamiento.

### 1. Entidad Intermedia

**Ubicación:** `packages/api/src/modules/equipamiento/entities/jornada-equipamiento.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Jornada } from '@/modules/jornada/entities/jornada.entity';
import { Equipamiento } from './equipamiento.entity';

@Entity({ name: 'jornada_equipamiento' })
export class JornadaEquipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jornada_id', type: 'int', nullable: false })
  jornadaId: number;

  @ManyToOne(() => Jornada, (jornada) => jornada.jornadaEquipamientos, { nullable: false })
  @JoinColumn({ name: 'jornada_id' })
  jornada?: Jornada;

  @Column({ name: 'equipamiento_id', type: 'int', nullable: false })
  equipamientoId: number;

  @ManyToOne(() => Equipamiento, (equipamiento) => equipamiento.jornadaEquipamientos, { nullable: false })
  @JoinColumn({ name: 'equipamiento_id' })
  equipamiento?: Equipamiento;
}
```

### 2. Entidades Principales

**Jornada:**
```typescript
import { OneToMany } from 'typeorm';
import { JornadaEquipamiento } from '@/modules/equipamiento/entities/jornada-equipamiento.entity';

@Entity('jornada')
export class Jornada extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Otros campos...

  @OneToMany(() => JornadaEquipamiento, je => je.jornada)
  jornadaEquipamientos?: JornadaEquipamiento[];
}
```

**Equipamiento:**
```typescript
import { OneToMany } from 'typeorm';
import { JornadaEquipamiento } from './jornada-equipamiento.entity';

@Entity('equipamiento')
export class Equipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Otros campos...

  @OneToMany(() => JornadaEquipamiento, je => je.equipamiento)
  jornadaEquipamientos?: JornadaEquipamiento[];
}
```

### 3. Servicio

**Ubicación:** `packages/api/src/modules/jornada/jornada.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jornada } from './entities/jornada.entity';
import { JornadaEquipamiento } from '@/modules/equipamiento/entities/jornada-equipamiento.entity';

@Injectable()
export class JornadaService {
  constructor(
    @InjectRepository(Jornada)
    private jornadaRepository: Repository<Jornada>,
    @InjectRepository(JornadaEquipamiento)
    private jornadaEquipamientoRepository: Repository<JornadaEquipamiento>,
  ) {}

  async updateEquipamiento(jornadaId: number, equipamientoIds: number[]) {
    // 1. Eliminar asociaciones existentes
    await this.jornadaEquipamientoRepository.delete({ jornadaId });

    // 2. Insertar nuevas asociaciones
    if (equipamientoIds && equipamientoIds.length > 0) {
      const jornadaEquipamientos = equipamientoIds.map(equipamientoId => ({
        jornadaId,
        equipamientoId,
      }));
      await this.jornadaEquipamientoRepository.save(jornadaEquipamientos);
    }

    // 3. Retornar entidad actualizada
    return await this.findOne(jornadaId);
  }

  async findOne(id: number) {
    return await this.jornadaRepository.findOne({
      where: { id },
      relations: [
        'jornadaEquipamientos',
        'jornadaEquipamientos.equipamiento',
      ],
    });
  }
}
```

### 4. Controlador

**Ubicación:** `packages/api/src/modules/jornada/jornada.controller.ts`

```typescript
import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { AsociarEquipamientoDto } from './dto/asociar-equipamiento.dto';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';

@Controller('jornada')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class JornadaController {
  constructor(private readonly jornadaService: JornadaService) {}

  @RequirePermissions(PERMISOS.JORNADA_EDITAR)
  @Patch(':id/equipamiento')
  updateEquipamiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsociarEquipamientoDto,
  ) {
    return this.jornadaService.updateEquipamiento(id, dto.equipamientoIds);
  }
}
```

### 5. DTO

**Ubicación:** `packages/api/src/modules/jornada/dto/asociar-equipamiento.dto.ts`

```typescript
import { IsArray, IsNumber } from 'class-validator';

export class AsociarEquipamientoDto {
  @IsArray()
  @IsNumber({}, { each: true })
  equipamientoIds: number[];
}
```

### 6. Módulo

**Módulo Jornada:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JornadaService } from './jornada.service';
import { JornadaController } from './jornada.controller';
import { Jornada } from './entities/jornada.entity';
import { JornadaEquipamiento } from '@/modules/equipamiento/entities/jornada-equipamiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jornada,
      JornadaEquipamiento,  // ✅ Importar entidad intermedia
    ]),
  ],
  controllers: [JornadaController],
  providers: [JornadaService],
})
export class JornadaModule {}
```

**Módulo Equipamiento:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipamientoService } from './equipamiento.service';
import { EquipamientoController } from './equipamiento.controller';
import { Equipamiento } from './entities/equipamiento.entity';
import { JornadaEquipamiento } from './entities/jornada-equipamiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipamiento,
      JornadaEquipamiento,  // ✅ Importar entidad intermedia
    ]),
  ],
  controllers: [EquipamientoController],
  providers: [EquipamientoService],
})
export class EquipamientoModule {}
```

### 7. Migración SQL

**Ubicación:** `packages/api/sql/75.sql`

```sql
CREATE TABLE IF NOT EXISTS `jornada_equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `jornada_id` INT NOT NULL,
  `equipamiento_id` INT NOT NULL,
  -- Campos de BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_jornada_equipamiento_jornada` FOREIGN KEY (`jornada_id`) REFERENCES `jornada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_jornada_equipamiento_equipamiento` FOREIGN KEY (`equipamiento_id`) REFERENCES `equipamiento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices en FKs
CREATE INDEX `IDX_jornada_equipamiento_jornada_id` ON `jornada_equipamiento`(`jornada_id`);
CREATE INDEX `IDX_jornada_equipamiento_equipamiento_id` ON `jornada_equipamiento`(`equipamiento_id`);
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Implementación de Servicio

```typescript
// ❌ INCORRECTO - Transacciones manuales
async updateEquipamiento(jornadaId: number, equipamientoIds: number[]) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.delete(JornadaEquipamiento, { jornadaId });

    if (equipamientoIds.length > 0) {
      const jornadaEquipamientos = equipamientoIds.map(equipamientoId => ({
        jornadaId,
        equipamientoId,
      }));
      await queryRunner.manager.save(JornadaEquipamiento, jornadaEquipamientos);
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// ✅ CORRECTO - Solo repositories
async updateEquipamiento(jornadaId: number, equipamientoIds: number[]) {
  await this.jornadaEquipamientoRepository.delete({ jornadaId });

  if (equipamientoIds && equipamientoIds.length > 0) {
    const jornadaEquipamientos = equipamientoIds.map(equipamientoId => ({
      jornadaId,
      equipamientoId,
    }));
    await this.jornadaEquipamientoRepository.save(jornadaEquipamientos);
  }

  return await this.findOne(jornadaId);
}
```

### Entidad Intermedia

```typescript
// ❌ INCORRECTO - Claves compuestas
@Entity({ name: 'jornada_equipamiento' })
export class JornadaEquipamiento {
  @PrimaryColumn()
  jornadaId: number;

  @PrimaryColumn()
  equipamientoId: number;
}

// ✅ CORRECTO - ID propio
@Entity({ name: 'jornada_equipamiento' })
export class JornadaEquipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jornada_id', type: 'int', nullable: false })
  jornadaId: number;

  @Column({ name: 'equipamiento_id', type: 'int', nullable: false })
  equipamientoId: number;
}
```

### Migración SQL

```typescript
// ❌ INCORRECTO - Sin CASCADE
CONSTRAINT `FK_jornada_equipamiento_jornada`
  FOREIGN KEY (`jornada_id`) REFERENCES `jornada`(`id`)

// ✅ CORRECTO - Con CASCADE
CONSTRAINT `FK_jornada_equipamiento_jornada`
  FOREIGN KEY (`jornada_id`) REFERENCES `jornada`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE
```

### Cargar Relaciones

```typescript
// ❌ INCORRECTO - No carga relaciones anidadas
async findOne(id: number) {
  return await this.jornadaRepository.findOne({
    where: { id },
    relations: ['jornadaEquipamientos'],  // Falta .equipamiento
  });
}

// ✅ CORRECTO - Relaciones anidadas
async findOne(id: number) {
  return await this.jornadaRepository.findOne({
    where: { id },
    relations: [
      'jornadaEquipamientos',
      'jornadaEquipamientos.equipamiento',  // ✅ Pobla equipamiento
    ],
  });
}
```

## Uso desde Frontend

```typescript
// Actualizar equipamiento de una jornada
const response = await fetchClient(`jornada/${jornadaId}/equipamiento`, 'PATCH', {
  equipamientoIds: [1, 2, 3]
});

// La respuesta incluye la jornada actualizada con relaciones pobladas
// response.jornadaEquipamientos contiene array de JornadaEquipamiento
// Cada item tiene equipamiento poblado
```

## Notas de Implementación

1. **Entidad intermedia en ambos módulos** - Asegurarse de importar en ambos lados
2. **Estrategia "reemplazo completo"** - Simplifica la lógica y evita duplicados
3. **ON DELETE CASCADE** - Limpia asociaciones automáticamente
4. **Relaciones anidadas** - Poblar datos de equipamiento en findOne
5. **BaseEntity** - Auditoría automática de creación/modificación
