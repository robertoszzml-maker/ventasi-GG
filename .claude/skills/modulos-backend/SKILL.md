---
name: modulos-backend
description: Crear módulos NestJS con TypeORM siguiendo patrones del proyecto
license: MIT
---

Genera módulos backend completos usando NestJS CLI con entidades TypeORM, servicios, controladores y permisos.

## Input

- `<nombre>`: Nombre del módulo en singular (ej: `equipamiento`, `proveedor`)

**Ejemplo:** `/modulos-backend equipamiento`

## Steps

### 1. Validar Nombre

- Verificar formato singular
- Comprobar que no existe en `packages/api/src/modules/`

### 2. Generar con NestJS CLI

```bash
cd packages/api
nest g resource modules/<nombre>
```

Opciones:
- Transport layer: **REST API**
- CRUD entry points: **Yes**

### 3. Configurar Entidad

Ver [reference.md](reference.md#entidad) para:
- Extender BaseEntity custom
- Decoradores @Column con `name` snake_case
- Tipos de datos (VARCHAR para valores, INT para IDs/FKs)

### 4. Implementar Servicio

Ver [reference.md](reference.md#servicio) para:
- `FindManyOptions<T>` en findAll
- `transformToGenericFilters` para filtros
- `.save()` directo (no `.create()`)
- `.delete()` (no `.softDelete()`)

### 5. Configurar Controlador

Ver [reference.md](reference.md#controlador) para:
- Guards obligatorios (JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
- `@RequirePermissions(...)` en cada endpoint
- `ParseIntPipe` para parámetros ID

### 6. Agregar Permisos

1. Backend: `packages/api/src/constants/permisos.ts`
2. Frontend: `packages/front/src/constants/permisos.ts` (idénticos)
3. Migración SQL: INSERT permissions

Ver [reference.md](reference.md#permisos)

### 7. Crear Migración SQL

Ver [template.md](template.md) para estructura completa tabla.

## Output

```
✅ Módulo creado: <nombre>

📁 Archivos generados:
   packages/api/src/modules/<nombre>/
   ├── entities/<nombre>.entity.ts
   ├── dto/create-<nombre>.dto.ts
   ├── dto/update-<nombre>.dto.ts
   ├── <nombre>.controller.ts
   ├── <nombre>.service.ts
   └── <nombre>.module.ts

📋 Próximos pasos:
   1. Agregar permisos (backend + frontend)
   2. Crear migración SQL
   3. Implementar frontend (hooks, services, forms, tables)
```

## Errores

- Módulo ya existe → Confirmar sobrescribir
- Error en NestJS CLI → Verificar instalación (`npm i -g @nestjs/cli`)

## Notes

- Ver [examples.md](examples.md) para casos completos
- BaseEntity custom incluye auditoría automática
- Siempre usar alias `@/` para imports
- Permisos backend/frontend deben ser idénticos
- ❌ NO agregar campo `activo` ni endpoint `GET /activas` — no se usa ese patrón en este proyecto. Si se necesita filtrar registros habilitados, hacerlo con filtros estándar sobre el `GET /`
