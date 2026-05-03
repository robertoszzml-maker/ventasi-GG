# Template: Nueva Asociación Muchos-a-Muchos

Este template muestra cómo implementar una nueva relación M:N entre dos entidades.

**Variables a reemplazar:**
- `[EntidadA]` - Primera entidad (ej: Jornada)
- `[EntidadB]` - Segunda entidad (ej: Equipamiento)
- `[entidad_a]` - Snake case (ej: jornada)
- `[entidad_b]` - Snake case (ej: equipamiento)
- `[EntidadAEntidadB]` - Clase intermedia (ej: JornadaEquipamiento)
- `[entidad_a_entidad_b]` - Tabla intermedia (ej: jornada_equipamiento)

## 1. Entidad Intermedia

**Ubicación:** `packages/api/src/modules/[entidad_b]/entities/[entidad_a]-[entidad_b].entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { [EntidadA] } from '@/modules/[entidad_a]/entities/[entidad_a].entity';
import { [EntidadB] } from './[entidad_b].entity';

@Entity({ name: '[entidad_a_entidad_b]' })
export class [EntidadAEntidadB] extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: '[entidad_a]_id', type: 'int', nullable: false })
  [entidadA]Id: number;

  @ManyToOne(() => [EntidadA], ([entidadA]) => [entidadA].[entidadA][EntidadB]s, { nullable: false })
  @JoinColumn({ name: '[entidad_a]_id' })
  [entidadA]?: [EntidadA];

  @Column({ name: '[entidad_b]_id', type: 'int', nullable: false })
  [entidadB]Id: number;

  @ManyToOne(() => [EntidadB], ([entidadB]) => [entidadB].[entidadA][EntidadB]s, { nullable: false })
  @JoinColumn({ name: '[entidad_b]_id' })
  [entidadB]?: [EntidadB];
}
```

## 2. Actualizar Entidades Principales

**EntidadA:**
```typescript
import { OneToMany } from 'typeorm';
import { [EntidadAEntidadB] } from '@/modules/[entidad_b]/entities/[entidad_a]-[entidad_b].entity';

@Entity('[entidad_a]')
export class [EntidadA] extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Otros campos...

  @OneToMany(() => [EntidadAEntidadB], item => item.[entidadA])
  [entidadA][EntidadB]s?: [EntidadAEntidadB][];
}
```

**EntidadB:**
```typescript
import { OneToMany } from 'typeorm';
import { [EntidadAEntidadB] } from './[entidad_a]-[entidad_b].entity';

@Entity('[entidad_b]')
export class [EntidadB] extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Otros campos...

  @OneToMany(() => [EntidadAEntidadB], item => item.[entidadB])
  [entidadA][EntidadB]s?: [EntidadAEntidadB][];
}
```

## 3. Servicio

**Ubicación:** `packages/api/src/modules/[entidad_a]/[entidad_a].service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [EntidadA] } from './entities/[entidad_a].entity';
import { [EntidadAEntidadB] } from '@/modules/[entidad_b]/entities/[entidad_a]-[entidad_b].entity';

@Injectable()
export class [EntidadA]Service {
  constructor(
    @InjectRepository([EntidadA])
    private [entidadA]Repository: Repository<[EntidadA]>,
    @InjectRepository([EntidadAEntidadB])
    private [entidadA][EntidadB]Repository: Repository<[EntidadAEntidadB]>,
  ) {}

  async update[EntidadB]([entidadA]Id: number, [entidadB]Ids: number[]) {
    // 1. Eliminar asociaciones existentes
    await this.[entidadA][EntidadB]Repository.delete({ [entidadA]Id });

    // 2. Insertar nuevas asociaciones
    if ([entidadB]Ids && [entidadB]Ids.length > 0) {
      const [entidadA][EntidadB]s = [entidadB]Ids.map([entidadB]Id => ({
        [entidadA]Id,
        [entidadB]Id,
      }));
      await this.[entidadA][EntidadB]Repository.save([entidadA][EntidadB]s);
    }

    // 3. Retornar entidad actualizada
    return await this.findOne([entidadA]Id);
  }

  async findOne(id: number) {
    return await this.[entidadA]Repository.findOne({
      where: { id },
      relations: [
        '[entidadA][EntidadB]s',
        '[entidadA][EntidadB]s.[entidadB]',
      ],
    });
  }
}
```

## 4. Controlador

**Ubicación:** `packages/api/src/modules/[entidad_a]/[entidad_a].controller.ts`

```typescript
import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { [EntidadA]Service } from './[entidad_a].service';
import { Asociar[EntidadB]Dto } from './dto/asociar-[entidad_b].dto';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';

@Controller('[entidad_a]')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class [EntidadA]Controller {
  constructor(private readonly [entidadA]Service: [EntidadA]Service) {}

  @RequirePermissions(PERMISOS.[ENTIDAD_A]_EDITAR)
  @Patch(':id/[entidad_b]')
  update[EntidadB](
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Asociar[EntidadB]Dto,
  ) {
    return this.[entidadA]Service.update[EntidadB](id, dto.[entidadB]Ids);
  }
}
```

## 5. DTO

**Ubicación:** `packages/api/src/modules/[entidad_a]/dto/asociar-[entidad_b].dto.ts`

```typescript
import { IsArray, IsNumber } from 'class-validator';

export class Asociar[EntidadB]Dto {
  @IsArray()
  @IsNumber({}, { each: true })
  [entidadB]Ids: number[];
}
```

## 6. Módulo EntidadA

**Ubicación:** `packages/api/src/modules/[entidad_a]/[entidad_a].module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { [EntidadA]Service } from './[entidad_a].service';
import { [EntidadA]Controller } from './[entidad_a].controller';
import { [EntidadA] } from './entities/[entidad_a].entity';
import { [EntidadAEntidadB] } from '@/modules/[entidad_b]/entities/[entidad_a]-[entidad_b].entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      [EntidadA],
      [EntidadAEntidadB],  // ✅ Importar entidad intermedia
    ]),
  ],
  controllers: [[EntidadA]Controller],
  providers: [[EntidadA]Service],
})
export class [EntidadA]Module {}
```

## 7. Módulo EntidadB

**Ubicación:** `packages/api/src/modules/[entidad_b]/[entidad_b].module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { [EntidadB]Service } from './[entidad_b].service';
import { [EntidadB]Controller } from './[entidad_b].controller';
import { [EntidadB] } from './entities/[entidad_b].entity';
import { [EntidadAEntidadB] } from './entities/[entidad_a]-[entidad_b].entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      [EntidadB],
      [EntidadAEntidadB],  // ✅ Importar entidad intermedia
    ]),
  ],
  controllers: [[EntidadB]Controller],
  providers: [[EntidadB]Service],
})
export class [EntidadB]Module {}
```

## 8. Migración SQL

**Ubicación:** `packages/api/sql/[numero].sql`

```sql
CREATE TABLE IF NOT EXISTS `[entidad_a_entidad_b]` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `[entidad_a]_id` INT NOT NULL,
  `[entidad_b]_id` INT NOT NULL,
  -- Campos de BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_[entidad_a_entidad_b]_[entidad_a]`
    FOREIGN KEY (`[entidad_a]_id`) REFERENCES `[entidad_a]`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_[entidad_a_entidad_b]_[entidad_b]`
    FOREIGN KEY (`[entidad_b]_id`) REFERENCES `[entidad_b]`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices en FKs
CREATE INDEX `IDX_[entidad_a_entidad_b]_[entidad_a]_id` ON `[entidad_a_entidad_b]`(`[entidad_a]_id`);
CREATE INDEX `IDX_[entidad_a_entidad_b]_[entidad_b]_id` ON `[entidad_a_entidad_b]`(`[entidad_b]_id`);
```

## Checklist de Implementación

### Entidades:
- [ ] Entidad intermedia creada en módulo de EntidadB
- [ ] Entidad intermedia extiende `BaseEntity`
- [ ] ID propio con `@PrimaryGeneratedColumn()`
- [ ] FKs con `@Column` + `@ManyToOne` + `@JoinColumn`
- [ ] `@OneToMany` agregado en EntidadA
- [ ] `@OneToMany` agregado en EntidadB

### Servicio:
- [ ] Método `update[EntidadB]` implementado
- [ ] Usa `repository.delete()` para eliminar asociaciones
- [ ] Usa `repository.save()` para guardar asociaciones
- [ ] Retorna `findOne()` con relaciones pobladas
- [ ] Método `findOne()` incluye relaciones anidadas

### Controlador:
- [ ] Endpoint `PATCH :id/[entidad_b]` creado
- [ ] DTO específico con validación
- [ ] Permiso `[ENTIDAD_A]_EDITAR` aplicado
- [ ] Guards aplicados

### SQL:
- [ ] Migración creada con número secuencial
- [ ] Campos de BaseEntity incluidos
- [ ] FKs con `ON DELETE CASCADE`
- [ ] FKs con `ON UPDATE CASCADE`
- [ ] Índices creados en FKs
- [ ] ENGINE y CHARSET especificados

### Módulos:
- [ ] Entidad intermedia importada en módulo de EntidadA
- [ ] Entidad intermedia importada en módulo de EntidadB
- [ ] Repository inyectado en servicio de EntidadA

## Ejemplo de Uso

```typescript
// Ejemplo: Jornada ↔ Equipamiento
// EntidadA = Jornada
// EntidadB = Equipamiento
// EntidadAEntidadB = JornadaEquipamiento
// entidad_a_entidad_b = jornada_equipamiento

// Actualizar equipamiento de una jornada
PATCH /jornada/1/equipamiento
{
  "equipamientoIds": [1, 2, 3]
}
```

## Notas

- ⚠️ **SIEMPRE** importar entidad intermedia en ambos módulos
- ✅ **SIEMPRE** usar estrategia "reemplazo completo" (delete + save)
- ✅ **SIEMPRE** usar `ON DELETE CASCADE` en FKs
- ✅ **NUNCA** usar transacciones manuales (DataSource/QueryRunner)
