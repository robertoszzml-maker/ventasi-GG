# Ejemplos - Formularios de Configuración

## Ejemplo Completo: Configuración de Banco

### 1. Permisos

**Backend y Frontend** (`constants/permisos.ts`):

```typescript
// Configuración - Banco
BANCO_CONFIG: 'BANCO_CONFIG',

// Rutas del menú - Config Banco
RUTA_BANCO_CONFIG: 'RUTA_BANCO_CONFIG',
```

### 2. Constantes

**Backend y Frontend** (`constants/config.ts`):

```typescript
// Módulo: Banco
BANCO_CUENTA_CONTABLE_BANCARIA: 'BANCO_CUENTA_CONTABLE_BANCARIA',
BANCO_CATEGORIA_EGRESO_DEFAULT: 'BANCO_CATEGORIA_EGRESO_DEFAULT',
BANCO_CATEGORIA_INGRESO_DEFAULT: 'BANCO_CATEGORIA_INGRESO_DEFAULT',
```

### 3. Formulario

**Ubicación:** `components/forms/config/banco-form.tsx`

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
import CuentaContableSelector from "@/components/selectors/cuenta-contable-selector"
import CategoriaSelector from "@/components/selectors/categoria-selector"

const formSchema = z.object({
    [CONFIGURACIONES.BANCO_CUENTA_CONTABLE_BANCARIA]: z.string().optional(),
    [CONFIGURACIONES.BANCO_CATEGORIA_EGRESO_DEFAULT]: z.string().optional(),
    [CONFIGURACIONES.BANCO_CATEGORIA_INGRESO_DEFAULT]: z.string().optional(),
});

export default function BancoForm() {
    const modulo = 'banco';
    const { data: configs = [] } = useGetConfigsByModuleQuery(modulo);
    const { mutateAsync: editConfig } = useEditConfigMutation();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            [CONFIGURACIONES.BANCO_CUENTA_CONTABLE_BANCARIA]:
                configs.find(c => c.clave === CONFIGURACIONES.BANCO_CUENTA_CONTABLE_BANCARIA)?.valor || "",
            [CONFIGURACIONES.BANCO_CATEGORIA_EGRESO_DEFAULT]:
                configs.find(c => c.clave === CONFIGURACIONES.BANCO_CATEGORIA_EGRESO_DEFAULT)?.valor || "",
            [CONFIGURACIONES.BANCO_CATEGORIA_INGRESO_DEFAULT]:
                configs.find(c => c.clave === CONFIGURACIONES.BANCO_CATEGORIA_INGRESO_DEFAULT)?.valor || "",
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
                <FormField
                    control={form.control}
                    name={CONFIGURACIONES.BANCO_CUENTA_CONTABLE_BANCARIA}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cuenta Contable Bancaria</FormLabel>
                            <FormControl>
                                <CuentaContableSelector
                                    value={field.value || ""}
                                    onChange={(value) => field.onChange(value)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={CONFIGURACIONES.BANCO_CATEGORIA_EGRESO_DEFAULT}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría Default Egresos</FormLabel>
                            <FormControl>
                                <CategoriaSelector
                                    value={field.value || ""}
                                    onChange={(value) => field.onChange(value)}
                                    tipo="egreso"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={CONFIGURACIONES.BANCO_CATEGORIA_INGRESO_DEFAULT}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría Default Ingresos</FormLabel>
                            <FormControl>
                                <CategoriaSelector
                                    value={field.value || ""}
                                    onChange={(value) => field.onChange(value)}
                                    tipo="ingreso"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit">Guardar Configuración</Button>
            </form>
        </Form>
    )
}
```

### 4. Página

**Ubicación:** `app/(admin)/config/banco/page.tsx`

```typescript
import BancoForm from "@/components/forms/config/banco-form";
import { PageTitle } from "@/components/ui/page-title";

export default function BancoConfigPage() {
  return (
    <>
      <PageTitle title="Configuración de Banco" />
      <BancoForm />
    </>
  );
}
```

### 5. Ruta en Menú

**Backend** (`constants/routes.ts`):

```typescript
{
  id: PERMISOS.RUTA_BANCO,
  title: 'Banco',
  url: '/banco',
  icon: 'Building2',
  items: [
    {
      id: PERMISOS.RUTA_BANCO_CONFIG,
      title: 'Configuración',
      url: '/config/banco',
      icon: 'Settings',
    },
  ]
},
```

### 6. Migración SQL

**Ubicación:** `packages/api/sql/80.sql`

```sql
-- Configuraciones Banco
INSERT INTO `config` (clave, valor, modulo, descripcion) VALUES
('BANCO_CUENTA_CONTABLE_BANCARIA', '', 'banco', 'Cuenta contable para movimientos bancarios'),
('BANCO_CATEGORIA_EGRESO_DEFAULT', '', 'banco', 'Categoría por defecto para egresos'),
('BANCO_CATEGORIA_INGRESO_DEFAULT', '', 'banco', 'Categoría por defecto para ingresos');

-- Permisos
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('BANCO_CONFIG', 'Configuración de banco', 'configuracion'),
('RUTA_BANCO_CONFIG', 'Acceso a configuración de banco', 'rutas');
```

## Tipos de Campos

### String Simple

```typescript
// Schema
[CONFIGURACIONES.MI_TEXTO]: z.string().optional()

// defaultValues
[CONFIGURACIONES.MI_TEXTO]:
    configs.find(c => c.clave === CONFIGURACIONES.MI_TEXTO)?.valor || ""

// Campo
<FormField
    control={form.control}
    name={CONFIGURACIONES.MI_TEXTO}
    render={({ field }) => (
        <FormItem>
            <FormLabel>Mi Texto</FormLabel>
            <FormControl>
                <Input {...field} />
            </FormControl>
        </FormItem>
    )}
/>
```

### Boolean (almacenar como '1'/'0')

```typescript
// Schema
[CONFIGURACIONES.MI_BOOLEAN]: z.boolean().optional()

// defaultValues
[CONFIGURACIONES.MI_BOOLEAN]:
    configs.find(c => c.clave === CONFIGURACIONES.MI_BOOLEAN)?.valor === '1'

// Campo
<FormField
    control={form.control}
    name={CONFIGURACIONES.MI_BOOLEAN}
    render={({ field }) => (
        <FormItem>
            <FormLabel>Mi Boolean</FormLabel>
            <FormControl>
                <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
            </FormControl>
        </FormItem>
    )}
/>

// onSubmit (convertir a string)
async function onSubmit(values: z.infer<typeof formSchema>) {
    for (const [clave, valor] of Object.entries(values)) {
        const config = configs.find(c => c.clave === clave);
        if (config?.id) {
            // Convertir boolean a '1'/'0'
            const valorString = typeof valor === 'boolean'
                ? (valor ? '1' : '0')
                : valor?.toString() || "";

            await editConfig({
                id: config.id,
                data: { ...config, valor: valorString }
            });
        }
    }
}
```

### Selector (FK)

```typescript
// Schema
[CONFIGURACIONES.MI_SELECTOR]: z.string().optional()

// defaultValues
[CONFIGURACIONES.MI_SELECTOR]:
    configs.find(c => c.clave === CONFIGURACIONES.MI_SELECTOR)?.valor || ""

// Campo
<FormField
    control={form.control}
    name={CONFIGURACIONES.MI_SELECTOR}
    render={({ field }) => (
        <FormItem>
            <FormLabel>Mi Selector</FormLabel>
            <FormControl>
                <MiSelector
                    value={field.value || ""}
                    onChange={(value) => field.onChange(value)}
                />
            </FormControl>
        </FormItem>
    )}
/>
```

## Comparaciones

### ✅ Correcto

```typescript
// Usar constantes
configs.find(c => c.clave === CONFIGURACIONES.BANCO_CUENTA)

// Buscar por módulo y clave
const { data: configs = [] } = useGetConfigsByModuleQuery('banco');

// Sin fallback para FKs
[CONFIGURACIONES.CATEGORIA_ID]:
    configs.find(c => c.clave === CONFIGURACIONES.CATEGORIA_ID)?.valor || ""

// Iterar en onSubmit
for (const [clave, valor] of Object.entries(values)) {
    const config = configs.find(c => c.clave === clave);
    // ...
}
```

### ❌ Incorrecto

```typescript
// Hardcodear claves
configs.find(c => c.clave === 'BANCO_CUENTA')

// Buscar por ID específico
const { data } = useGetConfigByIdQuery(42)

// Fallback numérico para FKs
categoriaId: data?.categoriaId || 0

// No iterar en onSubmit
await editConfig({
    id: configs[0].id,
    data: { valor: values.campo1 }
})
```
