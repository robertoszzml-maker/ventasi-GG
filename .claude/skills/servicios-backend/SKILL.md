---
name: servicios-backend
description: Crear servicios NestJS con QueryBuilder, relaciones y buildWhereAndOrderQuery
license: MIT
---

# Servicios Backend con QueryBuilder

Patrón estándar para servicios NestJS que necesitan relaciones, filtros y ordenamiento.

## Cuándo usar este patrón

Usar `QueryBuilder + buildWhereAndOrderQuery` cuando:
- El servicio necesita cargar relaciones en el `findAll`
- Se necesitan filtros sobre campos de relaciones (`subgrupo.nombre`)
- Se requiere más control que el `repo.find()` estándar

Usar `repo.find()` estándar (patrón simple de modulos-backend) cuando:
- El módulo es simple sin relaciones relevantes en el listado
- No hay filtros por relaciones

## Patrón findAll con QueryBuilder

```typescript
async findAll(conditions: FindManyOptions<MiEntidad>): Promise<MiEntidad[]> {
  const qb = this.repo.createQueryBuilder('miEntidad');

  const relaciones = ['relacion1', 'relacion1.subRelacion', 'relacion2'];
  for (const relation of relaciones) {
    qb.leftJoinAndSelect(`miEntidad.${relation}`, relation.split('.').pop());
  }

  buildWhereAndOrderQuery(qb, conditions, 'miEntidad');
  return await qb.getMany();
}
```

## Reglas críticas

- ✅ `buildWhereAndOrderQuery` maneja WHERE, ORDER, take y skip automáticamente
- ✅ El alias en `createQueryBuilder` debe coincidir con el tercer parámetro de `buildWhereAndOrderQuery`
- ✅ Para relaciones anidadas (`'subgrupo.grupo'`), el alias es la última parte (`grupo`)
- ✅ `getMany()` devuelve array limpio — nunca `getRawAndEntities()`
- ❌ No usar `getRawAndEntities()` — devuelve `{ raw, entities }` que rompe el modelo
- ❌ No duplicar la lógica de filtros/orden que ya hace `buildWhereAndOrderQuery`

## Import obligatorio

```typescript
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
```

## Template completo del servicio

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { MiEntidad } from './entities/mi-entidad.entity';
import { CreateMiEntidadDto } from './dto/create-mi-entidad.dto';
import { UpdateMiEntidadDto } from './dto/update-mi-entidad.dto';

@Injectable()
export class MiEntidadService {
  constructor(
    @InjectRepository(MiEntidad)
    private repo: Repository<MiEntidad>,
  ) {}

  async findAll(conditions: FindManyOptions<MiEntidad>): Promise<MiEntidad[]> {
    const qb = this.repo.createQueryBuilder('miEntidad');

    const relaciones = ['relacion1', 'relacion2'];
    for (const relation of relaciones) {
      qb.leftJoinAndSelect(`miEntidad.${relation}`, relation.split('.').pop());
    }

    buildWhereAndOrderQuery(qb, conditions, 'miEntidad');
    return await qb.getMany();
  }

  async findOne(id: number): Promise<MiEntidad> {
    return await this.repo.findOne({
      where: { id },
      relations: ['relacion1', 'relacion2'],
    });
  }

  async create(dto: CreateMiEntidadDto): Promise<MiEntidad> {
    const entity = await this.repo.save(dto);
    return await this.findOne(entity.id);
  }

  async update(id: number, dto: UpdateMiEntidadDto): Promise<MiEntidad> {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<MiEntidad> {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
```

## Relaciones anidadas — CRÍTICO

El loop con `articulo.${relation}` solo funciona para relaciones de **primer nivel**.
Para relaciones anidadas hay que ser explícito con el alias padre:

```typescript
// ❌ INCORRECTO — TypeORM no entiende 'articulo.subgrupo.grupo'
const relaciones = ['subgrupo', 'subgrupo.grupo', 'subgrupo.grupo.familia'];
for (const relation of relaciones) {
  qb.leftJoinAndSelect(`articulo.${relation}`, relation.split('.').pop());
}

// ✅ CORRECTO — cada join parte del alias anterior
qb.leftJoinAndSelect('articulo.subgrupo', 'subgrupo');
qb.leftJoinAndSelect('subgrupo.grupo', 'grupo');     // alias 'subgrupo', no 'articulo'
qb.leftJoinAndSelect('grupo.familia', 'familia');    // alias 'grupo', no 'articulo'
```

**Regla**: el prefijo de cada `leftJoinAndSelect` es el **alias** definido en el join anterior, no la entidad raíz.

## Diferencia con patrón simple

```typescript
// ❌ Patrón simple — sin relaciones en findAll
async findAll(conditions: FindManyOptions<T>) {
  return await this.repo.find({
    ...conditions,
    where: transformToGenericFilters(conditions.where),
  });
}

// ✅ Patrón QueryBuilder — con relaciones y filtros avanzados
async findAll(conditions: FindManyOptions<T>): Promise<T[]> {
  const qb = this.repo.createQueryBuilder('alias');
  const relaciones = ['rel1', 'rel2'];
  for (const relation of relaciones) {
    qb.leftJoinAndSelect(`alias.${relation}`, relation.split('.').pop());
  }
  buildWhereAndOrderQuery(qb, conditions, 'alias');
  return await qb.getMany();
}
```
