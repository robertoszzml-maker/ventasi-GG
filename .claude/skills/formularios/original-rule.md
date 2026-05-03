# Formularios Frontend

Formularios con react-hook-form + Zod + shadcn/ui en `components/forms/[nombre]-form.tsx`.

## Template Base

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MiEntidad } from "@/types"
import { useCreateMiEntidadMutation, useEditMiEntidadMutation } from '@/hooks/mi-entidad'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { LoadingButton } from "@/components/ui/loading-button"

const formSchema = z.object({
    id: z.number().optional(),  // ✅ Siempre opcional
    nombre: z.string({ message: 'Requerido' }).min(2),
    categoriaId: z.number().optional(),  // ✅ FKs sin fallback
});

type MyFormProps = {
    data?: MiEntidad;  // ✅ Siempre opcional
}

export default function MyForm({ data }: MyFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data?.id,
            nombre: data?.nombre || "",  // Strings con ""
            categoriaId: data?.categoriaId,  // ⚠️ FKs SIN fallback (NO poner || 0)
        }
    })

    const { mutateAsync: create, isPending: isPendingCreate } = useCreateMiEntidadMutation()
    const { mutateAsync: edit, isPending: isPendingEdit } = useEditMiEntidadMutation()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (values.id) {
                await edit({ id: values.id, data: values })
            } else {
                await create(values)
            }
            toast({ description: 'Éxito', variant: 'default' })
            router.back()
        } catch (error) {
            console.error("Error", error);
            toast({ description: 'Error', variant: 'destructive' })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-auto py-10">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="" type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2">
                    <LoadingButton loading={isPendingCreate || isPendingEdit} type="submit">
                        Guardar
                    </LoadingButton>
                    <Button type="button" onClick={() => router.back()} variant={"link"}>
                        Volver
                    </Button>
                </div>
            </form>
        </Form>
    )
}
```

## Tipos de Campos

### Input Texto
```typescript
<Input placeholder="" type="text" {...field} />
```

### InputNumber
```typescript
import { InputNumber } from "@/components/ui/input-number"
<InputNumber {...field} onChange={(value) => field.onChange(value)} />
```

### InputMoney
```typescript
import { InputMoney } from "@/components/input-money"
<InputMoney value={field.value} onChange={(value) => field.onChange(value)} />
```

### Textarea
```typescript
<Textarea placeholder="" {...field} />
```

### Checkbox
```typescript
<Checkbox checked={field.value} onCheckedChange={field.onChange} />
```

### DatePicker
```typescript
<DatePicker label="Fecha" form={form} name="fecha" fromYear={2025} />
```
Schema: `fecha: z.date().optional()`
defaultValues: `fecha: data?.fecha ? new Date(data.fecha) : undefined`

### Selectores Simples (Select dropdown)

Para selects que manejan IDs:

```typescript
<FormField
    control={form.control}
    name="metodoPagoId"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Método</FormLabel>
            <MetodoPagoSelector
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(value ? parseInt(value) : null)}
            />
            <FormMessage />
        </FormItem>
    )}
/>
```

### Autocompletadores (Objeto completo)

Para autocompletadores que manejan objetos poblados:

```typescript
<FormField
    control={form.control}
    name="proveedorId"  // Schema tiene proveedorId: z.number().optional()
    render={({ field }) => (
        <FormItem>
            <FormLabel>Proveedor</FormLabel>
            <ProveedorSelector
                value={data?.proveedor}  // Objeto completo poblado
                onChange={(proveedor) => field.onChange(proveedor.id)}  // Solo guardar ID
            />
            <FormMessage />
        </FormItem>
    )}
/>
```
defaultValues: `proveedorId: data?.proveedorId` (solo ID)

## Layout Responsive

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
  <div className="sm:col-span-2 lg:col-span-4">
    <FormField name="campo1" />  {/* 33% desktop, 100% tablet, 100% móvil */}
  </div>
  <div className="lg:col-span-2">
    <FormField name="campo2" />  {/* 16% desktop, 50% tablet */}
  </div>
</div>
```

Breakpoints: `< 640px` móvil, `640px+` tablet, `1024px+` desktop

## Orden de Hooks

```typescript
1. useToast()
2. useRouter() from 'next/navigation'
3. useForm()
4. useCreate...Mutation()
5. useEdit...Mutation()
```

## Checklist

- [ ] `"use client"` al inicio
- [ ] `useRouter` de `'next/navigation'`
- [ ] `id: z.number().optional()` en schema
- [ ] `data?: Tipo` en props
- [ ] FKs sin fallback `|| 0`
- [ ] `if (values.id)` para editar
- [ ] `router.back()` después de éxito
- [ ] `LoadingButton` con `isPendingCreate || isPendingEdit`
- [ ] `type="button"` en botón Volver
- [ ] `<FormMessage />` en cada campo

## Anti-patrones

```typescript
// ❌ NO
categoriaId: data?.categoriaId || 0  // ✅ Sin fallback
data.nombre  // ✅ usar data?.nombre
const { isPending } = useCreate...()  // ✅ usar isPendingCreate
<Button type="submit">Volver</Button>  // ✅ type="button"

// ✅ SÍ
categoriaId: data?.categoriaId
data?.nombre || ""
isPendingCreate || isPendingEdit
type="button" en Volver
```

## Resumen

| Aspecto | Valor |
|---------|-------|
| Schema | `z.object({ id: z.number().optional() })` |
| Props | `data?: Tipo` |
| FKs | SIN fallback |
| Strings | `|| ""` |
| onSubmit | `if (values.id)` editar, sino crear |
| Loading | `isPendingCreate \|\| isPendingEdit` |
| Router | `'next/navigation'` |
