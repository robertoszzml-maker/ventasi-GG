# Referencia Técnica: Asociaciones Muchos-a-Muchos

## Estructura de Entidades

### Entidad Intermedia

Crear una entidad intermedia con:
- Extiende `BaseEntity` (para auditoría)
- `@Entity({ name: 'tabla_intermedia' })`
- Campo `id` con `@PrimaryGeneratedColumn()`
- Campos FK con `@Column` + `@ManyToOne` + `@JoinColumn`

```typescript
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

### Entidades Principales

Agregar relación `@OneToMany` en ambas entidades:

```typescript
@OneToMany(() => JornadaEquipamiento, je => je.jornada)
jornadaEquipamientos?: JornadaEquipamiento[];
```

## Patrón de Servicio

### ❌ NO hacer (evitar transacciones manuales)

```typescript
// INCORRECTO - No usar DataSource ni QueryRunner
async updateAsociacion(id: number, ids: number[]) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  // ...
}
```

### ✅ SÍ hacer (usar solo repositories)

```typescript
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
```

**Pasos obligatorios:**
1. `repository.delete()` - Eliminar asociaciones existentes
2. `repository.save()` - Guardar nuevas asociaciones
3. `findOne()` - Retornar entidad con relaciones pobladas

## Controlador

Agregar endpoint dedicado con DTO específico:

```typescript
@RequirePermissions(PERMISOS.ENTIDAD_EDITAR)
@Patch(':id/asociacion')
updateAsociacion(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: AsociarDto,
) {
  return this.service.updateAsociacion(id, dto.asociadosIds);
}
```

## DTO de Asociación

Crear DTO específico con validación:

```typescript
import { IsArray, IsNumber } from 'class-validator';

export class AsociarEquipamientoDto {
  @IsArray()
  @IsNumber({}, { each: true })
  equipamientoIds: number[];
}
```

## Migración SQL

```sql
CREATE TABLE IF NOT EXISTS `tabla_intermedia` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entidad_a_id` INT NOT NULL,
  `entidad_b_id` INT NOT NULL,
  -- Campos de BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_tabla_intermedia_a` FOREIGN KEY (`entidad_a_id`) REFERENCES `entidad_a`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_tabla_intermedia_b` FOREIGN KEY (`entidad_b_id`) REFERENCES `entidad_b`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices en FKs
CREATE INDEX `IDX_tabla_intermedia_a_id` ON `tabla_intermedia`(`entidad_a_id`);
CREATE INDEX `IDX_tabla_intermedia_b_id` ON `tabla_intermedia`(`entidad_b_id`);
```

**Características:**
- `ON DELETE CASCADE` para eliminar asociaciones automáticamente
- `ON UPDATE CASCADE` para actualizar FKs automáticamente
- Índices en FKs para mejorar performance
- Campos de auditoría de BaseEntity

## Módulo

Registrar entidad intermedia en **ambos** módulos:

```typescript
// En módulo de entidad A
@Module({
  imports: [TypeOrmModule.forFeature([EntidadA, EntidadB_EntidadA])],
  // ...
})

// En módulo de entidad B
@Module({
  imports: [TypeOrmModule.forFeature([EntidadB, EntidadB_EntidadA])],
  // ...
})
```

**⚠️ Importante:** La entidad intermedia debe estar registrada en ambos módulos para que los repositorios funcionen correctamente.

## Relaciones en findOne

Incluir relaciones anidadas para poblar datos:

```typescript
async findOne(id: number) {
  return await this.repository.findOne({
    where: { id },
    relations: [
      'asociaciones',
      'asociaciones.entidadRelacionada',
    ],
  });
}
```

**Ejemplo concreto:**
```typescript
async findOne(id: number) {
  return await this.jornadaRepository.findOne({
    where: { id },
    relations: [
      'jornadaEquipamientos',
      'jornadaEquipamientos.equipamiento',
    ],
  });
}
```

## Restricciones Importantes

1. **NUNCA** usar `DataSource` ni `QueryRunner` para operaciones de asociación
2. **SIEMPRE** usar `repository.delete()` y `repository.save()`
3. **SIEMPRE** usar estrategia de "reemplazo completo" (delete + save)
4. **SIEMPRE** usar tabla intermedia con ID propio (no claves compuestas)
5. **SIEMPRE** extender de `BaseEntity` para auditoría
6. **SIEMPRE** usar `ON DELETE CASCADE` en FKs de tabla intermedia
7. **SIEMPRE** crear índices en claves foráneas
8. **SIEMPRE** registrar entidad intermedia en ambos módulos

## Ventajas del Patrón

1. **Simplicidad**: No requiere transacciones manuales
2. **Auditoría**: BaseEntity registra automáticamente creación/modificación
3. **Consistencia**: Estrategia "reemplazo completo" evita inconsistencias
4. **Performance**: Índices en FKs mejoran consultas
5. **Cascada**: Eliminación automática de asociaciones huérfanas

## Anti-patrones

```typescript
// ❌ NO usar transacciones manuales
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

// ❌ NO usar claves compuestas
@PrimaryColumn()
jornadaId: number;
@PrimaryColumn()
equipamientoId: number;

// ❌ NO actualizar asociaciones manualmente (sin delete previo)
await this.repository.save(nuevasAsociaciones);  // Duplicados!

// ✅ SÍ usar repositories con delete + save
await this.repository.delete({ jornadaId });
await this.repository.save(nuevasAsociaciones);
```

## Checklist de Implementación

- [ ] Entidad intermedia extiende `BaseEntity`
- [ ] Entidad intermedia tiene ID propio con `@PrimaryGeneratedColumn()`
- [ ] FKs con `@Column` + `@ManyToOne` + `@JoinColumn`
- [ ] `@OneToMany` en ambas entidades principales
- [ ] Servicio usa `repository.delete()` + `repository.save()`
- [ ] Endpoint dedicado con DTO específico
- [ ] Migración SQL con `ON DELETE CASCADE`
- [ ] Índices en FKs
- [ ] Entidad intermedia registrada en ambos módulos
- [ ] `findOne()` incluye relaciones anidadas
- [ ] DTO valida array de IDs con `@IsArray()` y `@IsNumber()`
