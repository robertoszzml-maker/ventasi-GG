# Template - Formulario de Configuración

Usa este template como base para crear nuevos formularios de configuración.

## Paso 1: Permisos

**Backend:** `packages/api/src/constants/permisos.ts`
```typescript
// Configuración - [MÓDULO]
[MODULO]_CONFIG: '[MODULO]_CONFIG',

// Rutas del menú - Config [MÓDULO]
RUTA_[MODULO]_CONFIG: 'RUTA_[MODULO]_CONFIG',
```

**Frontend:** `packages/front/src/constants/permisos.ts`
```typescript
// COPIAR IDÉNTICO AL BACKEND
```

## Paso 2: Constantes

**Backend:** `packages/api/src/constants/config.ts`
```typescript
// Módulo: [MÓDULO]
[NOMBRE_CONFIG_1]: '[NOMBRE_CONFIG_1]',
[NOMBRE_CONFIG_2]: '[NOMBRE_CONFIG_2]',
```

**Frontend:** `packages/front/src/constants/config.ts`
```typescript
// COPIAR IDÉNTICO AL BACKEND
```

## Paso 3: Formulario

**Ubicación:** `packages/front/src/components/forms/config/[modulo]-form.tsx`

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGetConfigsByModuleQuery, useEditConfigMutation } from '@/hooks/config'
import { CONFIGURACIONES } from '@/constants/config'
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

// Importar selectores si es necesario
// import MiSelector from "@/components/selectors/mi-selector"

const formSchema = z.object({
    // Agregar campos aquí
    // [CONFIGURACIONES.MI_CAMPO]: z.string().optional(),
});

export default function [MODULO]Form() {
    const modulo = '[modulo-en-minusculas]';
    const { data: configs = [] } = useGetConfigsByModuleQuery(modulo);
    const { mutateAsync: editConfig } = useEditConfigMutation();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Agregar defaultValues aquí
            // [CONFIGURACIONES.MI_CAMPO]:
            //     configs.find(c => c.clave === CONFIGURACIONES.MI_CAMPO)?.valor || "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        for (const [clave, valor] of Object.entries(values)) {
            const config = configs.find(c => c.clave === clave);
            if (config?.id) {
                await editConfig({
                    id: config.id,
                    data: { ...config, valor: valor?.toString() || "" }
                });
            }
        }
        toast({ description: 'Configuración actualizada', variant: 'default' })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Agregar FormField aquí */}

                <Button type="submit">Guardar Configuración</Button>
            </form>
        </Form>
    )
}
```

## Paso 4: Página

**Ubicación:** `packages/front/src/app/(admin)/config/[modulo]/page.tsx`

```typescript
import [MODULO]Form from "@/components/forms/config/[modulo]-form";
import { PageTitle } from "@/components/ui/page-title";

export default function [MODULO]ConfigPage() {
  return (
    <>
      <PageTitle title="Configuración de [MÓDULO]" />
      <[MODULO]Form />
    </>
  );
}
```

## Paso 5: Ruta en Menú

**Backend:** `packages/api/src/constants/routes.ts`

Agregar dentro de la sección del módulo:

```typescript
{
  id: PERMISOS.RUTA_[MODULO]_CONFIG,
  title: 'Configuración',
  url: '/config/[modulo]',
  icon: 'Settings',
},
```

## Paso 6: Migración SQL

**Ubicación:** `packages/api/sql/[numero].sql`

```sql
-- Configuraciones [MÓDULO]
INSERT INTO `config` (clave, valor, modulo, descripcion) VALUES
('[NOMBRE_CONFIG_1]', 'valor_default', '[modulo]', 'Descripción del campo'),
('[NOMBRE_CONFIG_2]', 'valor_default', '[modulo]', 'Descripción del campo');

-- Permisos
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('[MODULO]_CONFIG', 'Configuración de [módulo]', 'configuracion'),
('RUTA_[MODULO]_CONFIG', 'Acceso a configuración de [módulo]', 'rutas');
```

## Checklist

Antes de finalizar, verificar:

- [ ] Permisos backend === frontend
- [ ] Constantes backend === frontend
- [ ] Clave en BD === nombre constante
- [ ] Form usa `useGetConfigsByModuleQuery(modulo)`
- [ ] defaultValues busca por `clave === CONFIGURACIONES.X`
- [ ] onSubmit itera `Object.entries(values)`
- [ ] Página es Server Component (sin lógica)
- [ ] Ruta agregada en sección correcta
- [ ] SQL sin asignar roles
