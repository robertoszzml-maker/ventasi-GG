---
name: manejo-fechas
description: Gestión de fechas con helpers de inicialización y formateo
license: MIT
---

# Manejo de Fechas

Gestión de fechas almacenadas como strings con helpers para inicialización y formateo.

## Descripción

Este skill implementa el patrón de fechas del proyecto:
- Almacenamiento como string `"YYYY-MM-DD"` o `"YYYY-MM-DD HH:mm:ss"`
- Helpers de inicialización para zona horaria Argentina
- Helpers de formateo para display

## Input

Contexto de implementación:
- Backend: DTOs, entidades, servicios
- Frontend: Forms, schemas Zod, components display

**Ejemplo:** `/manejo-fechas` (aplica patrones al código actual)

## Steps

### 1. Validar Tipos de Datos

- Backend: `fecha: string` en DTOs y entidades
- Frontend: `z.string()` en schemas
- BD: `VARCHAR(100)` para fechas de negocio
- Auditoría: `DATETIME(6)` solo para `created_at`, `updated_at`, `deleted_at`

### 2. Aplicar Helpers de Inicialización

**Backend:**
- Importar `getTodayDateTime()` de `@/helpers/date-utils`
- Usar para timestamps: `createdAt: getTodayDateTime()`

**Frontend:**
- Importar `today()` y `getTodayDateTime()` de `@/utils/date`
- Usar en defaultValues: `fecha: data?.fecha || today()`

### 3. Aplicar Helpers de Formateo

**Frontend:**
- Importar `formatDate()`, `formatTime()`, `formatDay()`, `getTime()` de `@/utils/date`
- Reemplazar display de raw strings
- Usar helper apropiado según contexto

### 4. Implementar DatePicker

Para inputs de fecha:
- Importar `DatePicker` de `@/components/ui/date-picker`
- Schema: `z.date().optional()`
- defaultValues: `new Date(data.fecha)` si existe

### 5. Validar Anti-patrones

- ❌ NO usar `new Date()` para inicializar
- ❌ NO usar tipo `Date` en DTOs/schemas
- ❌ NO mostrar raw strings en UI
- ✅ Usar helpers para todo

## Output

Código actualizado con:
- ✅ Fechas almacenadas como strings
- ✅ Helpers de inicialización aplicados
- ✅ Helpers de formateo en display
- ✅ DatePicker configurado correctamente
- ✅ Sin anti-patrones

## Referencias

- **[reference.md](./reference.md)**: Patrones técnicos y helpers disponibles
- **[examples.md](./examples.md)**: Ejemplos de uso en backend y frontend
- **[template.md](./template.md)**: Template para nuevas entidades con fechas

## Notas

- Zona horaria Argentina configurada en helpers
- DatePicker es excepción: maneja Date internamente pero guarda string
- ⚠️ **NUNCA** usar `new Date()` directamente
