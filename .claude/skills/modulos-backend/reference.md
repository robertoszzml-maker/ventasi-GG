# Módulos Backend - Referencia Técnica

Patrones y convenciones para crear módulos NestJS + TypeORM.

## Comando Base

```bash
cd packages/api
nest g resource modules/<nombre>
```

**Opciones CLI:**
- Transport layer: **REST API**
- Generate CRUD entry points: **Yes**

---

## Entidad

### BaseEntity Custom

**✅ Correcto:**
```typescript
import { BaseEntity } from '@/common/base.entity';  // Custom con auditoría

@Entity('tabla_nombre')
export class MiEntidad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'columna_bd', type: 'varchar' })
  columnaCamelCase: string;
}
```

**❌ Incorrecto:**
```typescript
import { BaseEntity } from 'typeorm';  // NO usar TypeORM directo
```

### Decoradores @Column

```typescript
// ✅ Especificar name (snake_case) y type
@Column({ name: 'anio_fabricacion', type: 'varchar', length: 100, nullable: true })
anioFabricacion: string;

@Column({ name: 'tipo_id', type: 'int', nullable: false })
tipoId: number;

// ❌ Sin name (usaría camelCase en BD)
@Column({ type: 'varchar' })
anioFabricacion: string;
```

### Tipos de Datos

| Uso | Tipo BD | Tipo TS |
|-----|---------|---------|
| ID/FK | `INT` | `number` |
| Valores de negocio | `VARCHAR(100)` | `string` |
| Fechas de negocio | `VARCHAR(100)` | `string` |
| Auditoría (timestamps) | `DATETIME(6)` | `string` |

**BaseEntity Custom incluye:**
```typescript
// Timestamps
createdAt: string;    // DATETIME(6)
updatedAt: string;    // DATETIME(6)
deletedAt?: string;   // DATETIME(6) NULL

// Auditoría
createdBy?: number;   // INT NULL
updatedBy?: number;   // INT NULL
deletedBy?: number;   // INT NULL
```

---

## Servicio

### Patrón Estándar

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/transform-to-generic-filters';
import { MiEntidad } from './entities/mi-entidad.entity';
import { CreateMiEntidadDto } from './dto/create-mi-entidad.dto';
import { UpdateMiEntidadDto } from './dto/update-mi-entidad.dto';

@Injectable()
export class MiEntidadService {
  constructor(
    @InjectRepository(MiEntidad)
    private repo: Repository<MiEntidad>
  ) {}

  async findAll(conditions: FindManyOptions<MiEntidad>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateMiEntidadDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateMiEntidadDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
```

### Reglas Críticas

| Aspecto | ✅ Correcto | ❌ Incorrecto |
|---------|------------|--------------|
| findAll | `FindManyOptions<T>` | Parámetros hardcodeados |
| Filtros | `transformToGenericFilters()` | Sin transformación |
| create | `.save(dto)` directo | `.create()` antes de `.save()` |
| remove | `.delete({ id })` | `.softDelete({ id })` |
| Relaciones | `relations: ['rel']` | Eager loading por defecto |

---

## Controlador

### Patrón Estándar

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { MiEntidadService } from './mi-entidad.service';
import { CreateMiEntidadDto } from './dto/create-mi-entidad.dto';
import { UpdateMiEntidadDto } from './dto/update-mi-entidad.dto';

@Controller('mi-entidad')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MiEntidadController {
  constructor(private readonly service: MiEntidadService) {}

  @RequirePermissions(PERMISOS.MI_ENTIDAD_VER)
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

  @RequirePermissions(PERMISOS.MI_ENTIDAD_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @RequirePermissions(PERMISOS.MI_ENTIDAD_CREAR)
  @Post()
  create(@Body() dto: CreateMiEntidadDto) {
    return this.service.create(dto);
  }

  @RequirePermissions(PERMISOS.MI_ENTIDAD_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMiEntidadDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.MI_ENTIDAD_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

### Guards Obligatorios

```typescript
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
```

**Los 3 guards son OBLIGATORIOS** en orden exacto.

### Query Parameters

```typescript
@Query('limit') take: number      // Paginación: cantidad
@Query('skip') skip: number       // Paginación: offset
@Query('filter') filter: string   // Filtros JSON
@Query('order') order: string     // Ordenamiento JSON
```

---

## Permisos

### Backend (`packages/api/src/constants/permisos.ts`)

```typescript
export const PERMISOS = {
  // CRUD - Mi Entidad
  MI_ENTIDAD_VER: "MI_ENTIDAD_VER",
  MI_ENTIDAD_CREAR: "MI_ENTIDAD_CREAR",
  MI_ENTIDAD_EDITAR: "MI_ENTIDAD_EDITAR",
  MI_ENTIDAD_ELIMINAR: "MI_ENTIDAD_ELIMINAR",

  // Rutas del menú - Mi Entidad
  RUTA_MI_ENTIDAD: "RUTA_MI_ENTIDAD",
} as const;
```

### Frontend (`packages/front/src/constants/permisos.ts`)

**IDÉNTICO al backend:**

```typescript
export const PERMISOS = {
  // CRUD - Mi Entidad
  MI_ENTIDAD_VER: "MI_ENTIDAD_VER",
  MI_ENTIDAD_CREAR: "MI_ENTIDAD_CREAR",
  MI_ENTIDAD_EDITAR: "MI_ENTIDAD_EDITAR",
  MI_ENTIDAD_ELIMINAR: "MI_ENTIDAD_ELIMINAR",

  // Rutas del menú - Mi Entidad
  RUTA_MI_ENTIDAD: "RUTA_MI_ENTIDAD",
} as const;
```

### Migración SQL

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('MI_ENTIDAD_VER', 'Ver mi entidad', 'mi-entidad'),
('MI_ENTIDAD_CREAR', 'Crear mi entidad', 'mi-entidad'),
('MI_ENTIDAD_EDITAR', 'Editar mi entidad', 'mi-entidad'),
('MI_ENTIDAD_ELIMINAR', 'Eliminar mi entidad', 'mi-entidad'),
('RUTA_MI_ENTIDAD', 'Acceso a página mi entidad', 'rutas');

-- ❌ NO asignar a roles en migración
```

---

## Aliases de Imports

```typescript
// ✅ Usar alias @/
import { BaseEntity } from '@/common/base.entity';
import { PERMISOS } from '@/constants/permisos';
import { transformToGenericFilters } from '@/helpers/transform-to-generic-filters';

// ❌ NO usar rutas relativas
import { BaseEntity } from '../../common/base.entity';
```

---

## Checklist Completo

### Entidad
- [ ] Extiende `@/common/base.entity`
- [ ] Decorador `@Entity('nombre_tabla')`
- [ ] Todos los `@Column` con `name` snake_case
- [ ] Tipos correctos (INT para IDs, VARCHAR para valores)
- [ ] Property names en camelCase

### Servicio
- [ ] `findAll(conditions: FindManyOptions<T>)`
- [ ] Usa `transformToGenericFilters()`
- [ ] `.save()` directo (no `.create()`)
- [ ] `.delete()` (no `.softDelete()`)
- [ ] Constructor con `@InjectRepository()`

### Controlador
- [ ] `@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)`
- [ ] `@RequirePermissions()` en todos los endpoints
- [ ] `ParseIntPipe` en parámetros ID
- [ ] Query params para findAll (take, skip, filter, order)

### Permisos
- [ ] Agregados en backend `permisos.ts`
- [ ] Agregados en frontend `permisos.ts` (idénticos)
- [ ] Migración SQL con INSERT permissions
- [ ] NO asignar a roles en migración

### Migración SQL
- [ ] Tabla con campos base de BaseEntity
- [ ] Columnas en snake_case
- [ ] VARCHAR para valores, INT para IDs/FKs
- [ ] Constraints e índices necesarios

---

## Anti-patrones

```typescript
// ❌ NO
import { BaseEntity } from 'typeorm';
.create() antes de .save()
.softDelete()
@Column() sin name
Orden hardcodeado en servicio
findAll() sin parámetros
Rutas relativas en imports

// ✅ SÍ
import { BaseEntity } from '@/common/base.entity';
.save() directo
.delete()
@Column({ name: 'snake_case' })
Orden desde query params
findAll(conditions: FindManyOptions<T>)
Imports con alias @/
```
