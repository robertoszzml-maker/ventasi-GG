---
name: migraciones-sql
description: Crear migraciones SQL siguiendo las convenciones del proyecto
license: MIT
---

Crear archivos de migración SQL en `packages/api/sql/` con las reglas del proyecto.

## Input

- `<número>`: Número secuencial de migración (ej: `77`, `78`)
- `[descripción]`: Descripción opcional de la migración

## Steps

### 1. Validar Número

- Verificar último número usado en `packages/api/sql/`
- Sugerir siguiente número disponible
- Confirmar que no existe archivo duplicado

### 2. Crear Estructura Base

- Tabla con campos de negocio
- Campos de BaseEntity (created_at, updated_at, etc.)
- Índices necesarios
- Permisos (sin asignar a roles)

### 3. Aplicar Reglas Críticas

- ❌ NO usar ENGINE/CHARSET/COLLATE
- ❌ NO asignar permisos a roles
- ✅ Fechas de negocio como VARCHAR(100)
- ✅ DATETIME(6) solo para BaseEntity

### 4. Generar Archivo

Crear `packages/api/sql/<número>.sql` con contenido validado.

### 5. Confirmar

Mostrar ubicación y recordar próximos pasos.

## Output

```
✅ Migración creada: <número>.sql

📄 packages/api/sql/<número>.sql
📋 Contiene: [tabla/índices/permisos]

⚠️  Recordar:
- NO ejecutar manualmente
- Asignar permisos desde interfaz admin
- Verificar en desarrollo antes de merge
```

## Errores

- Número duplicado → Sugerir siguiente disponible
- Ubicación incorrecta → Solo `packages/api/sql/`
- ENGINE/CHARSET → Eliminar automáticamente

## Notes

- Siempre usar `CREATE TABLE IF NOT EXISTS`
- Fechas de negocio: VARCHAR(100)
- BaseEntity: DATETIME(6) con defaults
- Ver detalles técnicos en reference.md

## See Also

- [Referencia Técnica](reference.md) - Reglas completas y estructura
- [Ejemplos](examples.md) - Migraciones completas de ejemplo
- [Template](template.md) - Template base para nuevas tablas
- [Script Helper](scripts/helper.sh) - Obtener próximo número
