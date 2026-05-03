# Templates: Páginas CRUD Frontend

## Template Completo

Copiar exactamente estos templates al crear páginas CRUD.

---

## 📄 Listado (page.tsx)

```typescript
import [Entidad]Table from "@/components/tables/[entidad]-table";
import { PageTitle } from "@/components/ui/page-title";

export default function [Entidades]Page() {
  return (
    <>
      <PageTitle title="[Entidades]" />
      <[Entidad]Table />
    </>
  );
}
```

**Reemplazar:**
- `[Entidad]` → Nombre singular PascalCase (ej: `Proveedor`)
- `[Entidades]` → Nombre plural capitalizado (ej: `Proveedores`)
- `[entidad]` → Nombre singular kebab-case (ej: `proveedor`)

---

## 📄 Crear (crear/page.tsx)

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

**Características:**
- ✅ Server Component (NO 'use client')
- ✅ Solo imports: Form + PageTitle
- ✅ Form SIN prop `data`
- ✅ Función se llama `Create[Entidad]`

**Reemplazar:**
- `[Entidad]` → Nombre singular PascalCase (ej: `Proveedor`)
- `[entidad]` → Nombre singular kebab-case (ej: `proveedor`)

---

## 📄 Editar ([id]/page.tsx)

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

**Características CRÍTICAS:**
- ✅ `'use client'` con **comilla simple** (línea 1)
- ✅ Línea en blanco después de 'use client'
- ✅ Orden de imports: Form → PageTitle → Hook → React
- ✅ Función se llama EXACTAMENTE `Page` (no EditPage ni otro)
- ✅ `params: Promise<{ id: string }>` (Next.js 15)
- ✅ `React.use(params)` para obtener id
- ✅ Hook recibe `id` directamente (string, NO parseInt)
- ✅ Desestructurar: `{ data, isLoading, isFetching }`
- ✅ Condición: `if (isLoading || isFetching) return <>Cargando...</>`
- ✅ Fragment vacío `<>` NO `<React.Fragment>`
- ✅ Form con `data={data}`

**Reemplazar:**
- `[Entidad]` → Nombre singular PascalCase (ej: `Proveedor`)
- `[entidad]` → Nombre singular kebab-case (ej: `proveedor`)

---

## Ejemplos de Reemplazo

### Proveedor

**Listado:**
```typescript
import ProveedorTable from "@/components/tables/proveedor-table";
import { PageTitle } from "@/components/ui/page-title";

export default function ProveedoresPage() {
  return (
    <>
      <PageTitle title="Proveedores" />
      <ProveedorTable />
    </>
  );
}
```

**Crear:**
```typescript
import ProveedorForm from "@/components/forms/proveedor-form"
import { PageTitle } from "@/components/ui/page-title"

export default function CreateProveedor() {
    return <>
        <PageTitle title="Crear Proveedor" />
        <ProveedorForm />
    </>
}
```

**Editar:**
```typescript
'use client'

import ProveedorForm from "@/components/forms/proveedor-form"
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
            <ProveedorForm data={data} />
        </>
    );
}
```

---

### Equipamiento

**Crear:**
```typescript
import EquipamientoForm from "@/components/forms/equipamiento-form"
import { PageTitle } from "@/components/ui/page-title"

export default function CreateEquipamiento() {
    return <>
        <PageTitle title="Crear Equipamiento" />
        <EquipamientoForm />
    </>
}
```

**Editar:**
```typescript
'use client'

import EquipamientoForm from "@/components/forms/equipamiento-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetEquipamientoByIdQuery } from '@/hooks/equipamiento'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGetEquipamientoByIdQuery(id);
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Equipamiento" />
            <EquipamientoForm data={data} />
        </>
    );
}
```

---

## Checklist de Validación

Antes de confirmar la creación, verificar:

### Estructura de carpetas:
- [ ] Carpeta en **plural** (`proveedores/` no `proveedor/`)
- [ ] Path "crear" (no "nuevo")
- [ ] Archivos en ubicaciones correctas

### Listado (page.tsx):
- [ ] Imports correctos (Table + PageTitle)
- [ ] Nombre función termina en `Page`

### Crear (crear/page.tsx):
- [ ] NO tiene 'use client'
- [ ] Solo imports: Form + PageTitle
- [ ] Form SIN prop `data`
- [ ] Función se llama `Create[Entidad]`

### Editar ([id]/page.tsx):
- [ ] Tiene 'use client' con **comilla simple**
- [ ] Línea en blanco después de 'use client'
- [ ] Orden de imports: Form → PageTitle → Hook → React
- [ ] Función se llama `Page`
- [ ] `params: Promise<{ id: string }>`
- [ ] `React.use(params)` para obtener id
- [ ] Hook recibe id directamente (NO parseInt)
- [ ] Desestructura `{ data, isLoading, isFetching }`
- [ ] Condición `isLoading || isFetching`
- [ ] Fragment vacío `<>`
- [ ] Form con `data={data}`

---

## Anti-patrones a Evitar

### ❌ NO hacer:

```typescript
// ❌ Carpeta singular
app/(admin)/proveedor/

// ❌ Path "nuevo"
app/(admin)/proveedores/nuevo/

// ❌ Comillas dobles en 'use client'
"use client"

// ❌ Función con nombre descriptivo
export default function EditProveedor() { }

// ❌ params sin Promise
params: { id: string }

// ❌ Destructuring directo de params
const { id } = params;

// ❌ parseInt en id
useGetProveedorByIdQuery(parseInt(id))

// ❌ React.Fragment explícito
<React.Fragment>Cargando...</React.Fragment>

// ❌ Manejo elaborado de errores
if (isError || !data) return <div>Error</div>

// ❌ SkeletonForm
if (isLoading) return <SkeletonForm />
```

### ✅ SÍ hacer:

```typescript
// ✅ Carpeta plural
app/(admin)/proveedores/

// ✅ Path "crear"
app/(admin)/proveedores/crear/

// ✅ Comillas simples en 'use client'
'use client'

// ✅ Función se llama Page
export default function Page() { }

// ✅ params con Promise
params: Promise<{ id: string }>

// ✅ React.use(params)
const { id } = React.use(params);

// ✅ id directo (string)
useGetProveedorByIdQuery(id)

// ✅ Fragment vacío
<>Cargando...</>

// ✅ Manejo simple
if (isLoading || isFetching) return <>Cargando...</>
```
