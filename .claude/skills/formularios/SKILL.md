---
name: formularios
description: Crear formularios con react-hook-form + Zod + shadcn/ui
license: MIT
---

Crear formularios frontend con validación Zod y manejo de estado con react-hook-form.

## Input

- `<entidad>`: Nombre de la entidad (ej: `proveedor`, `equipamiento`)
- `[modo]`: `crear` o `editar` (opcional, genera ambos por defecto)

## Steps

### 1. Validar Contexto

- Verificar que existe el tipo en `@/types`
- Verificar hooks en `@/hooks/[entidad]`
- Confirmar estructura del proyecto

### 2. Generar Schema Zod

- Crear schema basado en el tipo de la entidad
- `id: z.number().optional()` siempre
- FKs sin fallback (`|| 0`)
- Strings con fallback vacío (`|| ""`)

### 3. Crear Formulario

- Template completo en `components/forms/[entidad]-form.tsx`
- Props: **siempre `data?: Entidad`** — nunca usar el nombre de la entidad (ej: NO `plantilla?`, NO `proveedor?`)
- Hooks: useToast → useRouter → useForm → mutations
- Submit: `if (values.id)` edit, else create

### 4. Configurar Campos

- Elegir componentes según tipo de dato
- Layout responsive con grid
- Validaciones en schema
- FormMessage en cada campo

### 5. Confirmar

Mostrar ubicación del archivo y próximos pasos.

## Output

```
✅ Formulario creado: [entidad]-form.tsx

📄 components/forms/[entidad]-form.tsx
🔧 Listo para usar en páginas crear/[id]

Próximos pasos:
1. Importar en páginas CRUD
2. Ajustar campos según necesidad
3. Verificar validaciones
```

## Errores

- Tipo no existe → Crear primero en `@/types`
- Hooks faltantes → Ejecutar `/hooks-frontend [entidad]`
- Schema inválido → Revisar tipos de datos

## Notes

- SIEMPRE usar `"use client"` al inicio
- FKs sin fallback por defecto
- LoadingButton con ambos isPending
- Ver detalles técnicos en reference.md

## See Also

- [Referencia Técnica](reference.md) - Patrones y reglas completas
- [Ejemplos](examples.md) - Casos de uso reales
- [Template](template.md) - Template base para completar
