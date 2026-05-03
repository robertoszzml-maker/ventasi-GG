# Módulos Backend (NestJS + TypeORM)

Crear módulos usando NestJS CLI desde `packages/api`.

## Comando Base

```bash
cd packages/api
nest g resource modules/<nombre>  # Elegir: REST API + Yes CRUD
```

## Reglas Críticas

### 1. BaseEntity Custom

```typescript
import { BaseEntity } from '@/common/base.entity';  // ✅ Custom
import { BaseEntity } from 'typeorm';  // ❌ NO

@Entity('tabla_nombre')
export class MiEntidad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'columna_bd', type: 'varchar' })
  columnaCamelCase: string;  // ✅ name en snake_case, property en camelCase
}
```

### 2. Servicio Estándar

```typescript
@Injectable()
export class MiService {
  constructor(
    @InjectRepository(MiEntidad)
    private repo: Repository<MiEntidad>
  ) {}

  // ✅ FindManyOptions para filtrado dinámico
  async findAll(conditions: FindManyOptions<MiEntidad>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateDto) {
    return await this.repo.save(dto);  // ✅ save() directo, sin .create()
  }

  async update(id: number, dto: UpdateDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });  // ✅ delete(), NO softDelete()
    return entity;
  }
}
```

### 3. Controlador con Permisos

```typescript
@Controller('mi-recurso')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MiController {
  @RequirePermissions(PERMISOS.MI_RECURSO_VER)
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

  @RequirePermissions(PERMISOS.MI_RECURSO_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @RequirePermissions(PERMISOS.MI_RECURSO_CREAR)
  @Post()
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @RequirePermissions(PERMISOS.MI_RECURSO_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.MI_RECURSO_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

## Checklist Rápido

**Al crear módulo nuevo:**

1. `cd packages/api` → `nest g resource modules/<nombre>`
2. **Entidad**: Extender `@/common/base.entity`, `@Column({ name: 'snake_case' })`
3. **Servicio**: `FindManyOptions`, `transformToGenericFilters`, `delete()` no `softDelete()`
4. **Controlador**: `@UseGuards(...)`, `@RequirePermissions(...)`, `ParseIntPipe`
5. **Permisos**: Agregar en `permisos.ts` (backend + frontend), migración SQL
6. **Migración**: Tabla + campos BaseEntity + permisos (sin asignar a roles)

## Anti-patrones

```typescript
// ❌ NO
.create() antes de .save()
.softDelete() (usar .delete())
BaseEntity de typeorm
Olvidar name en @Column
Orden hardcodeado en servicio
FindAll sin parámetros

// ✅ SÍ
.save() directo
.delete()
BaseEntity custom
name: 'snake_case' siempre
Orden desde query params
FindAll(conditions)
```

## BaseEntity Custom

```typescript
// @/common/base.entity.ts - Incluye:
// - createdAt, updatedAt, deletedAt (timestamps)
// - createdBy, updatedBy, deletedBy (auditoría)
// - Soft delete automático
```

## Aliases

```typescript
import { X } from '@/path';  // ✅ Alias @/
import { X } from '../../path';  // ❌ Rutas relativas
```

## Resumen

| Aspecto | Valor |
|---------|-------|
| CLI | `nest g resource modules/<nombre>` |
| BaseEntity | `@/common/base.entity` (custom) |
| Tabla/Columnas | snake_case con `name` |
| Service.findAll | `FindManyOptions<T>` |
| Service.remove | `.delete()` no `.softDelete()` |
| Controller | 3 guards + ParseIntPipe |
| Permisos | Backend + Frontend + SQL |
