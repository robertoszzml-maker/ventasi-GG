---
name: asociaciones-muchos-a-muchos
description: Patrón para implementar relaciones muchos-a-muchos con tabla intermedia
license: MIT
---

# Asociaciones Muchos-a-Muchos

Implementación de relaciones M:N con tabla intermedia usando repositorios (sin transacciones manuales).

## Descripción

Este skill implementa el patrón estándar para relaciones muchos-a-muchos:
- Tabla intermedia con ID propio (no claves compuestas)
- Estrategia "reemplazo completo" (delete + save)
- Solo repositorios (NO DataSource/QueryRunner)
- Auditoría automática con BaseEntity

## Input

Contexto de asociación:
- Dos entidades a relacionar (ej: Jornada ↔ Equipamiento)
- Nombre de la relación (ej: "jornada_equipamiento")

**Ejemplo:** `/asociaciones-muchos-a-muchos` (aplica patrón al código actual)

## Steps

### 1. Crear Entidad Intermedia

- Extender de `BaseEntity` para auditoría
- ID propio con `@PrimaryGeneratedColumn()`
- Campos FK con `@Column` + `@ManyToOne` + `@JoinColumn`
- Nombre tabla en snake_case

### 2. Actualizar Entidades Principales

- Agregar `@OneToMany` en ambas entidades
- Apuntar a entidad intermedia

### 3. Implementar Servicio

**Patrón obligatorio:**
1. `repository.delete()` - Eliminar asociaciones existentes
2. `repository.save()` - Guardar nuevas asociaciones
3. `findOne()` - Retornar entidad con relaciones pobladas

**❌ NO usar:** DataSource, QueryRunner, transacciones manuales

### 4. Crear Endpoint

- Endpoint dedicado: `PATCH :id/asociacion`
- DTO específico con validación
- Permiso `ENTIDAD_EDITAR`

### 5. Migración SQL

- Tabla intermedia con campos de BaseEntity
- FKs con `ON DELETE CASCADE ON UPDATE CASCADE`
- Índices en claves foráneas
- Sin ENGINE ni CHARSET explícitos

### 6. Registrar en Módulos

- Importar entidad intermedia en **ambos** módulos
- `TypeOrmModule.forFeature([EntidadA, EntidadIntermedia])`

### 7. Cargar Relaciones

- En `findOne()` incluir relaciones anidadas
- `relations: ['asociaciones', 'asociaciones.entidadRelacionada']`

## Output

Código implementado con:
- ✅ Entidad intermedia creada
- ✅ `@OneToMany` en entidades principales
- ✅ Servicio con patrón delete + save
- ✅ Endpoint dedicado con DTO
- ✅ Migración SQL con índices
- ✅ Entidad registrada en módulos
- ✅ Relaciones cargadas en findOne

## Referencias

- **[reference.md](./reference.md)**: Patrones técnicos y restricciones
- **[examples.md](./examples.md)**: Ejemplo completo Jornada-Equipamiento
- **[template.md](./template.md)**: Template para nuevas asociaciones M:N

## Restricciones Críticas

1. **NUNCA** usar `DataSource` ni `QueryRunner`
2. **SIEMPRE** usar estrategia "reemplazo completo" (delete + save)
3. **SIEMPRE** usar tabla intermedia con ID propio
4. **SIEMPRE** extender de `BaseEntity`
5. **SIEMPRE** usar `ON DELETE CASCADE` en FKs
6. **SIEMPRE** crear índices en FKs
7. **SIEMPRE** registrar entidad en ambos módulos

## Notas

- ⚠️ **NO** usar claves compuestas
- ✅ **SIEMPRE** usar `repository.delete()` y `repository.save()`
- ✅ Estrategia "reemplazo completo" simplifica la lógica
