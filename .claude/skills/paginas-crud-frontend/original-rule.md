# Reglas para Páginas CRUD (Frontend)

## Patrón Obligatorio

Todas las páginas CRUD en `packages/front/src/app/(admin)/[modulo]/` DEBEN seguir este patrón exacto.

---

## 🗂️ Estructura de Carpetas

```
app/(admin)/
└── [modulo]/              # ✅ Nombre en PLURAL (proveedores, equipamientos, jornadas)
    ├── page.tsx           # Listado principal
    ├── crear/             # ✅ Usar "crear" NO "nuevo"
    │   └── page.tsx       # Página de creación
    └── [id]/              # Página de edición
        └── page.tsx
```

**Convenciones:**
- ✅ Carpeta en **plural**: `proveedores/`, `equipamientos/`, `jornadas/`
- ✅ Path para crear: `crear/` NO `nuevo/`
- ❌ NO usar singular: `proveedor/`, `equipamiento/`

---

## 📄 Página de Creación (crear/page.tsx)

### Template

```typescript
import [Entidad]Form from "@/components/forms/[entidad]-form"
import { PageTitle } from "@/components/ui/page-title"

export default function Create[Entidad]() {
    return <>
        <PageTitle title="Crear [Entidad]" />
        <[Entidad]Form />
    </>
}
```

### Ejemplo Completo

```typescript
// packages/front/src/app/(admin)/proveedores/crear/page.tsx
import ProveedoresForm from "@/components/forms/proveedor-form"
import { PageTitle } from "@/components/ui/page-title"

export default function CreateProveedor() {
    return <>
        <PageTitle title="Crear Proveedor" />
        <ProveedoresForm />
    </>
}
```

**Características:**
- ✅ Muy simple, solo PageTitle + Form
- ✅ Form **sin** prop `data`
- ✅ NO maneja loading ni errores (el form lo hace)

---

## 📝 Página de Edición ([id]/page.tsx)

### Template (COPIAR EXACTAMENTE)

```typescript
'use client'

import [Entidad]Form from "@/components/forms/[entidad]-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGet[Entidad]ByIdQuery } from '@/hooks/[entidad]'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGet[Entidad]ByIdQuery(id);
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar [Entidad]" />
            <[Entidad]Form data={data} />
        </>
    );
}
```

### Ejemplo Real (packages/front/src/app/(admin)/proveedores/[id]/page.tsx)

```typescript
'use client'

import ProveedorsForm from "@/components/forms/proveedor-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetProveedorByIdQuery } from '@/hooks/proveedor'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGetProveedorByIdQuery(id);
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Proveedor" />
            <ProveedorsForm data={data} />
        </>
    );
}
```

**Orden exacto de imports:**
1. `'use client'` con comilla simple
2. Línea en blanco
3. Form component
4. PageTitle
5. Hook
6. React
7. Línea en blanco antes de export

**Características EXACTAS:**
- ✅ `'use client'` con **comilla simple** al inicio
- ✅ Imports en orden: Form → PageTitle → Hook → React
- ✅ Función se llama exactamente `Page` (no EditPage ni otro nombre)
- ✅ `params: Promise<{ id: string }>` (Next.js 15)
- ✅ `React.use(params)` para obtener id
- ✅ Hook recibe `id` directamente (string, el hook convierte internamente)
- ✅ Desestructurar: `{ data, isLoading, isFetching }`
- ✅ Condición: `if (isLoading || isFetching) return <>Cargando...</>`
- ✅ Fragment vacío `<>` NO `<React.Fragment>`
- ✅ PageTitle con "Editar [Entidad]" (singular, capitalizado)
- ✅ Form recibe `data={data}` exactamente así

---

## 🚨 Errores Comunes

### ❌ NO hacer:

1. **Carpeta en singular:**
   ```
   // ❌ INCORRECTO
   app/(admin)/proveedor/
   app/(admin)/equipamiento/

   // ✅ CORRECTO
   app/(admin)/proveedores/
   app/(admin)/equipamientos/
   ```

2. **Path "nuevo" en lugar de "crear":**
   ```
   // ❌ INCORRECTO
   app/(admin)/proveedores/nuevo/page.tsx

   // ✅ CORRECTO
   app/(admin)/proveedores/crear/page.tsx
   ```

3. **Destructuring directo de params:**
   ```typescript
   // ❌ INCORRECTO (Next.js 15+)
   export default function Page({ params }: { params: { id: string } }) {
       const { id } = params;

   // ✅ CORRECTO
   export default function Page({ params }: { params: Promise<{ id: string }> }) {
       const { id } = React.use(params);
   ```

4. **Nombre de función incorrecto:**
   ```typescript
   // ❌ INCORRECTO
   export default function EditProveedor({ params }) { ... }
   export default function ProveedorDetailPage({ params }) { ... }

   // ✅ CORRECTO
   export default function Page({ params }: { params: Promise<{ id: string }> }) { ... }
   ```

5. **Comillas dobles en 'use client':**
   ```typescript
   // ❌ INCORRECTO
   "use client"

   // ✅ CORRECTO
   'use client'
   ```

6. **Fragment con React.Fragment:**
   ```typescript
   // ❌ INCORRECTO
   return <React.Fragment>Cargando...</React.Fragment>

   // ✅ CORRECTO
   return <>Cargando...</>
   ```

7. **parseInt() en id:**
   ```typescript
   // ❌ INCORRECTO
   const { data } = useGetProveedorByIdQuery(parseInt(id));

   // ✅ CORRECTO (pasar id directamente como string)
   const { data } = useGetProveedorByIdQuery(id);
   ```

8. **Manejo elaborado de errores:**
   ```typescript
   // ❌ INCORRECTO
   if (isError || !data) {
       return <div className="text-destructive">Error...</div>
   }

   // ✅ CORRECTO (simple)
   if (isLoading || isFetching) return <>Cargando...</>
   ```

9. **SkeletonForm u otros componentes de carga:**
   ```typescript
   // ❌ INCORRECTO
   if (isLoading) return <SkeletonForm />

   // ✅ CORRECTO
   if (isLoading || isFetching) return <>Cargando...</>
   ```

10. **Orden de imports incorrecto:**
    ```typescript
    // ❌ INCORRECTO
    import React from 'react'
    import { PageTitle } from "@/components/ui/page-title"
    import { useGetProveedorByIdQuery } from '@/hooks/proveedor'
    import ProveedorsForm from "@/components/forms/proveedor-form"

    // ✅ CORRECTO (orden específico)
    import ProveedorsForm from "@/components/forms/proveedor-form"
    import { PageTitle } from "@/components/ui/page-title"
    import { useGetProveedorByIdQuery } from '@/hooks/proveedor'
    import React from 'react'
    ```

---

## ✅ Checklist

### Página crear/page.tsx:
- [ ] NO usa `'use client'`
- [ ] Solo importa PageTitle y Form
- [ ] PageTitle con título "Crear [Entidad]"
- [ ] Form sin prop `data`
- [ ] Función se llama `Create[Entidad]`

### Página [id]/page.tsx:
- [ ] Usa `'use client'` con **comilla simple**
- [ ] Orden de imports: Form → PageTitle → Hook → React
- [ ] Función se llama exactamente `Page`
- [ ] `params: Promise<{ id: string }>`
- [ ] Usa `React.use(params)` para obtener id
- [ ] Hook `useGet[Entidad]ByIdQuery(id)` recibe string directamente
- [ ] Desestructura `{ data, isLoading, isFetching }`
- [ ] Verifica `isLoading || isFetching`
- [ ] Retorna `<>Cargando...</>` (fragment vacío)
- [ ] PageTitle con "Editar [Entidad]" (singular)
- [ ] Form con `data={data}`
- [ ] NO usa parseInt(id)
- [ ] NO maneja errores elaborados
- [ ] NO usa SkeletonForm
- [ ] NO usa React.Fragment

---

## 📋 Resumen Rápido

| Aspecto | Valor |
|---------|-------|
| Carpeta módulo | **Plural** (`proveedores/`) |
| Path crear | `crear/` NO `nuevo/` |
| params tipo | `Promise<{ id: string }>` |
| Obtener id | `React.use(params)` |
| Loading | `<>Cargando...</>` |
| Error | NO manejar (el form lo hace) |
| Skeleton | NO usar |
| parseInt(id) | NO necesario |
