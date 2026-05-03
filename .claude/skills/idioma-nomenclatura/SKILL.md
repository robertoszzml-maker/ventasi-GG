---
name: idioma-nomenclatura
description: Convenciones de idioma español y formatos de nomenclatura
license: MIT
---

# Idioma y Nomenclatura

Convenciones de idioma español y formatos de nomenclatura para código, archivos y base de datos.

## Descripción

Este skill aplica las convenciones de idioma y nomenclatura del proyecto:
- Todo en español excepto términos técnicos estándar
- Formatos específicos por contexto: kebab-case, snake_case, camelCase, PascalCase
- Columnas BD siempre en snake_case con `name` explícito

## Input

Contexto de código:
- Backend: entidades, DTOs, servicios
- Frontend: componentes, types, forms
- Base de datos: tablas, columnas

**Ejemplo:** `/idioma-nomenclatura` (valida y corrige nomenclatura)

## Steps

### 1. Validar Idioma

- Código en español (variables, funciones, clases)
- Excepciones: términos técnicos estándar (controller, service, etc.)
- Comentarios y mensajes en español

### 2. Aplicar Formato por Contexto

**Archivos/directorios:**
- kebab-case español
- Ejemplos: `equipamiento-tipo.entity.ts`, `proveedor-form.tsx`

**Columnas BD:**
- snake_case con `name` explícito
- FKs con sufijo `_id`

**Variables/Funciones:**
- camelCase español
- Ejemplos: `procesoGeneralId`, `crearEquipamiento()`

**Clases/Interfaces:**
- PascalCase español
- Ejemplos: `ProcesoGeneral`, `CrearEquipamientoDto`

**Constantes:**
- UPPER_SNAKE_CASE
- Ejemplo: `MAX_LIMIT`

### 3. Validar Columnas BD

- Siempre especificar `name` en `@Column()`
- snake_case en BD, camelCase en TypeScript
- FKs: `proceso_general_id` → `procesoGeneralId`

### 4. Corregir Anti-patrones

- ❌ Inglés en código
- ❌ snake_case en variables TypeScript
- ❌ camelCase en columnas BD
- ❌ PascalCase en archivos

## Output

Código con nomenclatura correcta:
- ✅ Idioma español consistente
- ✅ Formatos correctos por contexto
- ✅ Columnas BD con `name` explícito
- ✅ Sin anti-patrones

## Referencias

- **[reference.md](./reference.md)**: Tabla de formatos y reglas detalladas
- **[examples.md](./examples.md)**: Ejemplos backend y frontend
- **[template.md](./template.md)**: Template para nueva entidad

## Regla Crítica

**Columnas BD SIEMPRE con `name` explícito:**
```typescript
// ✅ CORRECTO
@Column({ name: 'proceso_general_id', type: 'int' })
procesoGeneralId: number;

// ❌ INCORRECTO (sin name, usaría camelCase en BD)
@Column({ type: 'int' })
procesoGeneralId: number;
```

## Resumen Rápido

| Contexto | Formato | Ejemplo |
|----------|---------|---------|
| Archivos/directorios | kebab-case | `equipamiento-tipo.entity.ts` |
| Columnas BD | snake_case | `proceso_general_id` |
| Variables/Funciones | camelCase | `procesoGeneralId` |
| Clases/Interfaces | PascalCase | `ProcesoGeneral` |
| Constantes | UPPER_SNAKE_CASE | `MAX_LIMIT` |

## Notas

- ⚠️ **SIEMPRE** especificar `name` en columnas BD
- ✅ Términos técnicos (controller, service) en inglés son aceptables
- ✅ Todo lo demás en español
