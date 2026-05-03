# Formularios de Configuración

Patrón para formularios de configuración con permisos y constantes.

## Pasos Obligatorios

Al crear formulario de configuración para un módulo:

1. Permisos (backend + frontend)
2. Constantes config (backend + frontend)
3. Formulario en `components/forms/config/[modulo]-form.tsx`
4. Página en `app/(admin)/config/[modulo]/page.tsx`
5. Ruta en menú (backend)
6. Migración SQL

## 1. Permisos

**Backend** (`packages/api/src/constants/permisos.ts`):
```typescript
// Configuración - [Módulo]
[MODULO]_CONFIG: '[MODULO]_CONFIG',

// Rutas del menú - Config [Módulo]
RUTA_[MODULO]_CONFIG: 'RUTA_[MODULO]_CONFIG',
```

**Frontend** (`packages/front/src/constants/permisos.ts`):
```typescript
// IDÉNTICO al backend
[MODULO]_CONFIG: '[MODULO]_CONFIG',
RUTA_[MODULO]_CONFIG: 'RUTA_[MODULO]_CONFIG',
```

## 2. Constantes Config

**Backend** (`packages/api/src/constants/config.ts`):
```typescript
// Módulo: [Módulo]
[NOMBRE_CONFIG]: 'clave_en_base_datos',
```

**Frontend** (`packages/front/src/constants/config.ts`):
```typescript
// IDÉNTICO al backend
[NOMBRE_CONFIG]: 'clave_en_base_datos',
```

**⚠️ Clave === Nombre constante** (para mantener sync)

## 3. Formulario

**Ubicación:** `components/forms/config/[modulo]-form.tsx`

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGetConfigsByModuleQuery, useEditConfigMutation } from '@/hooks/config'
import { CONFIGURACIONES } from '@/constants/config'

const formSchema = z.object({
    [CONFIGURACIONES.MI_CONFIG]: z.string().optional(),
});

export default function MiModuloForm() {
    const modulo = 'mi-modulo';
    const { data: configs = [] } = useGetConfigsByModuleQuery(modulo);
    const { mutateAsync: editConfig } = useEditConfigMutation();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            [CONFIGURACIONES.MI_CONFIG]:
                configs.find(c => c.clave === CONFIGURACIONES.MI_CONFIG)?.valor || "",
        }
    })

    async function onSubmit(values) {
        for (const [clave, valor] of Object.entries(values)) {
            const config = configs.find(c => c.clave === clave);
            if (config?.id) {
                await editConfig({
                    id: config.id,
                    data: { ...config, valor: valor?.toString() || "" }
                });
            }
        }
        toast({ description: 'Actualizado', variant: 'default' })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Campos aquí */}
            </form>
        </Form>
    )
}
```

**Tipos comunes:**

```typescript
// String
z.string().optional()

// Boolean (almacenar como '1'/'0')
z.boolean().optional()
// defaultValues: valor === '1'
// onSubmit: valor ? '1' : '0'

// Selector
<MiSelector
    value={field.value || ""}
    onChange={(value) => field.onChange(value)}
/>
```

## 4. Página

**Ubicación:** `app/(admin)/config/[modulo]/page.tsx`

```typescript
import MiModuloForm from "@/components/forms/config/mi-modulo-form";
import { PageTitle } from "@/components/ui/page-title";

export default function MiModuloConfigPage() {
  return (
    <>
      <PageTitle title="Configuración de Mi Módulo" />
      <MiModuloForm />
    </>
  );
}
```

## 5. Ruta en Menú

**Backend** (`packages/api/src/constants/routes.ts`):

```typescript
{
  id: PERMISOS.RUTA_[MODULO]_CONFIG,
  title: 'Configuración',
  url: '/config/[modulo]',
  icon: 'Settings',
},
```

## 6. Migración SQL

```sql
-- Configuraciones
INSERT INTO `config` (clave, valor, modulo, descripcion) VALUES
('MI_CONFIG_KEY', 'valor_default', 'mi-modulo', 'Descripción');

-- Permisos
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('[MODULO]_CONFIG', 'Configuración de [módulo]', 'configuracion'),
('RUTA_[MODULO]_CONFIG', 'Acceso a config [módulo]', 'rutas');

-- ❌ NO asignar a roles aquí
```

## Checklist

- [ ] Permisos backend + frontend idénticos
- [ ] Constantes backend + frontend idénticas
- [ ] Clave === Nombre constante
- [ ] Form usa `useGetConfigsByModuleQuery(modulo)`
- [ ] defaultValues busca por `clave === CONFIGURACIONES.X`
- [ ] onSubmit itera `Object.entries(values)`
- [ ] Página sin lógica (Server Component)
- [ ] Ruta agregada en módulo correcto
- [ ] SQL sin asignar roles

## Anti-patrones

```typescript
// ❌ NO
configs.find(c => c.clave === 'HARDCODED')  // ✅ usar CONFIGURACIONES.X
const { data } = useGetConfigByIdQuery(42)  // ✅ usar módulo + clave
categoriaId: data?.categoriaId || 0  // ✅ sin fallback para FKs
```

## Resumen

| Aspecto | Valor |
|---------|-------|
| Tabla | `config` (clave, valor, modulo, descripcion) |
| Hook | `useGetConfigsByModuleQuery(modulo)` |
| Schema | `[CONFIGURACIONES.KEY]: z.string().optional()` |
| defaultValues | `configs.find(c => c.clave === CONFIGURACIONES.KEY)?.valor` |
| onSubmit | `for...of Object.entries(values)` |
| Boolean | Almacenar '1'/'0' |
