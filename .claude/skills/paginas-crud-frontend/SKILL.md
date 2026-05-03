---
name: paginas-crud-frontend
description: Crear páginas CRUD (listado, crear, editar) siguiendo el patrón exacto del proyecto
license: MIT
---

# Páginas CRUD Frontend

Crea las páginas CRUD completas siguiendo el patrón estándar del proyecto.

## Input

- `<modulo>`: Nombre del módulo en **singular** (ej: `proveedor`, `equipamiento`, `jornada`)
- `<ruta-listado>` (opcional): URL del listado (default: nombre plural del módulo)

**Ejemplo:** `/paginas-crud-frontend equipamiento`

## Steps

### 1. Validar Entidad

- Verificar que existe el form en `components/forms/[modulo]-form.tsx`
- Verificar que existe el hook `useGet[Entidad]ByIdQuery` en `hooks/[modulo].tsx`
- Si faltan → Sugerir crear primero con `/formularios` o `/modulos-backend`

### 2. Crear Estructura de Carpetas

Estructura obligatoria:

```
app/(admin)/
└── [modulos]/              # ✅ Plural
    ├── page.tsx           # Listado principal
    ├── crear/             # ✅ "crear" NO "nuevo"
    │   └── page.tsx
    └── [id]/              # Edición
        └── page.tsx
```

### 3. Crear Página de Listado

`app/(admin)/[modulos]/page.tsx`:

- Importar tabla si existe en `components/tables/[modulo]-table`
- Si no existe tabla → Solo PageTitle con mensaje

### 4. Crear Página de Creación

`app/(admin)/[modulos]/crear/page.tsx`:

- Server Component (sin 'use client')
- Imports: Form + PageTitle
- Template exacto de reference.md

### 5. Crear Página de Edición

`app/(admin)/[modulos]/[id]/page.tsx`:

- 'use client' con comilla simple
- Imports en orden: Form → PageTitle → Hook → React
- Template exacto de reference.md
- Función se llama `Page`
- `params: Promise<{ id: string }>`
- `React.use(params)` para obtener id

### 6. Validar Convenciones

Verificar:

- [ ] Carpeta en plural (`proveedores/` no `proveedor/`)
- [ ] Path "crear" (no "nuevo")
- [ ] 'use client' con comilla simple en [id]/page.tsx
- [ ] Función Page en [id]/page.tsx
- [ ] Orden de imports correcto
- [ ] Fragment vacío `<>` (no React.Fragment)
- [ ] NO parseInt(id)
- [ ] NO manejo de errores elaborado

## Output

```
✅ Páginas CRUD creadas: [modulo]

📁 Estructura:
   app/(admin)/[modulos]/
   ├── page.tsx (listado)
   ├── crear/page.tsx
   └── [id]/page.tsx

📝 Próximos pasos:
   1. Agregar ruta al menú (si aplica)
   2. Verificar permisos en endpoints
```

## Documentación

- [reference.md](reference.md) - Patrones técnicos detallados
- [examples.md](examples.md) - Ejemplos completos
- [template.md](template.md) - Templates para copiar

## Notes

- La carpeta SIEMPRE en plural
- Path crear SIEMPRE "crear" (no "nuevo")
- Función en [id]/page.tsx SIEMPRE se llama `Page`
- 'use client' solo en [id]/page.tsx (con comilla simple)
- NO manejar errores (el form lo hace)
