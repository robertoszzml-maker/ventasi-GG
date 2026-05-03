# Ejemplos: Páginas CRUD Frontend

## Ejemplo Completo: Proveedores

### Estructura de Carpetas

```
app/(admin)/proveedores/
├── page.tsx           # Listado
├── crear/
│   └── page.tsx      # Crear proveedor
└── [id]/
    └── page.tsx      # Editar proveedor
```

### Listado (page.tsx)

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

### Crear (crear/page.tsx)

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

**Características:**
- ✅ Server Component (sin 'use client')
- ✅ Muy simple, solo PageTitle + Form
- ✅ Form **sin** prop `data`

### Editar ([id]/page.tsx)

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

**Características clave:**
- ✅ 'use client' con comilla simple
- ✅ Función se llama `Page`
- ✅ `params: Promise<{ id: string }>`
- ✅ `React.use(params)` para obtener id
- ✅ Fragment vacío `<>` (no React.Fragment)
- ✅ NO parseInt(id)
- ✅ NO manejo de errores elaborado

---

## Ejemplo Completo: Equipamiento

### Estructura de Carpetas

```
app/(admin)/equipamientos/     # ✅ Plural
├── page.tsx
├── crear/                     # ✅ "crear" NO "nuevo"
│   └── page.tsx
└── [id]/
    └── page.tsx
```

### Crear (crear/page.tsx)

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

### Editar ([id]/page.tsx)

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

## Ejemplo Completo: Jornadas

### Estructura de Carpetas

```
app/(admin)/jornadas/          # ✅ Plural (jornadas no jornada)
├── page.tsx
├── crear/
│   └── page.tsx
└── [id]/
    └── page.tsx
```

### Crear (crear/page.tsx)

```typescript
import JornadaForm from "@/components/forms/jornada-form"
import { PageTitle } from "@/components/ui/page-title"

export default function CreateJornada() {
    return <>
        <PageTitle title="Crear Jornada" />
        <JornadaForm />
    </>
}
```

### Editar ([id]/page.tsx)

```typescript
'use client'

import JornadaForm from "@/components/forms/jornada-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetJornadaByIdQuery } from '@/hooks/jornada'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGetJornadaByIdQuery(id);
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Jornada" />
            <JornadaForm data={data} />
        </>
    );
}
```

---

## Errores Comunes vs Soluciones

### ❌ Carpeta en singular

```
// ❌ INCORRECTO
app/(admin)/proveedor/crear/page.tsx
app/(admin)/equipamiento/[id]/page.tsx

// ✅ CORRECTO
app/(admin)/proveedores/crear/page.tsx
app/(admin)/equipamientos/[id]/page.tsx
```

### ❌ Path "nuevo" en lugar de "crear"

```
// ❌ INCORRECTO
app/(admin)/proveedores/nuevo/page.tsx

// ✅ CORRECTO
app/(admin)/proveedores/crear/page.tsx
```

### ❌ Comillas dobles en 'use client'

```typescript
// ❌ INCORRECTO
"use client"

import ProveedorForm from "@/components/forms/proveedor-form"

// ✅ CORRECTO
'use client'

import ProveedorForm from "@/components/forms/proveedor-form"
```

### ❌ Función con nombre descriptivo

```typescript
// ❌ INCORRECTO
export default function EditProveedor({ params }: { params: Promise<{ id: string }> }) {
    // ...
}

// ✅ CORRECTO
export default function Page({ params }: { params: Promise<{ id: string }> }) {
    // ...
}
```

### ❌ Destructuring directo de params

```typescript
// ❌ INCORRECTO (Next.js 15+)
export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data } = useGetProveedorByIdQuery(id);
    // ...
}

// ✅ CORRECTO
export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data } = useGetProveedorByIdQuery(id);
    // ...
}
```

### ❌ parseInt() en id

```typescript
// ❌ INCORRECTO
const { id } = React.use(params);
const { data } = useGetProveedorByIdQuery(parseInt(id));

// ✅ CORRECTO
const { id } = React.use(params);
const { data } = useGetProveedorByIdQuery(id);  // String directo
```

### ❌ React.Fragment explícito

```typescript
// ❌ INCORRECTO
if (isLoading || isFetching) return <React.Fragment>Cargando...</React.Fragment>

// ✅ CORRECTO
if (isLoading || isFetching) return <>Cargando...</>
```

### ❌ Manejo elaborado de errores

```typescript
// ❌ INCORRECTO
export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isError } = useGetProveedorByIdQuery(id);

    if (isLoading) return <SkeletonForm />;
    if (isError || !data) {
        return <div className="text-destructive">Error al cargar</div>;
    }

    return (
        <>
            <PageTitle title="Editar Proveedor" />
            <ProveedorForm data={data} />
        </>
    );
}

// ✅ CORRECTO (simple)
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

### ❌ Orden de imports incorrecto

```typescript
// ❌ INCORRECTO
'use client'

import React from 'react'
import { PageTitle } from "@/components/ui/page-title"
import { useGetProveedorByIdQuery } from '@/hooks/proveedor'
import ProveedorForm from "@/components/forms/proveedor-form"

// ✅ CORRECTO
'use client'

import ProveedorForm from "@/components/forms/proveedor-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetProveedorByIdQuery } from '@/hooks/proveedor'
import React from 'react'
```

---

## Flujo Completo de Creación

### 1. Verificar dependencias

Asegurar que existen:
- ✅ `components/forms/proveedor-form.tsx`
- ✅ `hooks/proveedor.tsx` con `useGetProveedorByIdQuery`
- ✅ `types/index.ts` con tipo `Proveedor`

### 2. Crear estructura

```bash
mkdir -p app/\(admin\)/proveedores/crear
mkdir -p app/\(admin\)/proveedores/\[id\]
```

### 3. Crear páginas

Usar templates de [template.md](template.md)

### 4. Validar convenciones

- [ ] Carpeta en plural
- [ ] Path "crear" (no "nuevo")
- [ ] Función `Page` en [id]/page.tsx
- [ ] 'use client' con comilla simple
- [ ] Orden de imports correcto
- [ ] NO parseInt(id)
