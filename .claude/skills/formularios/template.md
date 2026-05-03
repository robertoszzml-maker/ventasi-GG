# Template: Formulario Base

Template genérico para crear formularios con react-hook-form + Zod + shadcn/ui.

## Placeholders

- `<ENTIDAD>`: Nombre de la entidad en PascalCase (ej: `Proveedor`, `Equipamiento`)
- `<entidad>`: Nombre de la entidad en camelCase (ej: `proveedor`, `equipamiento`)
- `<CAMPO_N>`: Nombre del campo en camelCase (ej: `nombre`, `razonSocial`)
- `<TIPO_N>`: Tipo Zod del campo (ej: `z.string()`, `z.number().optional()`)
- `<LABEL_N>`: Etiqueta del campo (ej: `Nombre`, `Razón Social`)
- `<COMPONENTE_N>`: Componente de input (ej: `Input`, `InputMoney`, `Textarea`)

---

## Template Completo

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { <ENTIDAD> } from "@/types"
import { useCreate<ENTIDAD>Mutation, useEdit<ENTIDAD>Mutation } from '@/hooks/<entidad>'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { LoadingButton } from "@/components/ui/loading-button"

const formSchema = z.object({
    id: z.number().optional(),
    <CAMPO_1>: <TIPO_1>,
    <CAMPO_2>: <TIPO_2>,
    <CAMPO_3>: <TIPO_3>,
});

type <ENTIDAD>FormProps = {
    data?: <ENTIDAD>;
}

export default function <ENTIDAD>Form({ data }: <ENTIDAD>FormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data?.id,
            <CAMPO_1>: data?.<CAMPO_1> || "",
            <CAMPO_2>: data?.<CAMPO_2>,
            <CAMPO_3>: data?.<CAMPO_3> || "",
        }
    })

    const { mutateAsync: create, isPending: isPendingCreate } = useCreate<ENTIDAD>Mutation()
    const { mutateAsync: edit, isPending: isPendingEdit } = useEdit<ENTIDAD>Mutation()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (values.id) {
                await edit({ id: values.id, data: values })
            } else {
                await create(values)
            }
            toast({ description: '<ENTIDAD> guardado', variant: 'default' })
            router.back()
        } catch (error) {
            console.error("Error al guardar <entidad>", error);
            toast({ description: 'Error al guardar', variant: 'destructive' })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-auto py-10">
                <FormField
                    control={form.control}
                    name="<CAMPO_1>"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel><LABEL_1></FormLabel>
                            <FormControl>
                                <<COMPONENTE_1> placeholder="" type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="<CAMPO_2>"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel><LABEL_2></FormLabel>
                            <FormControl>
                                <<COMPONENTE_2> placeholder="" type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="<CAMPO_3>"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel><LABEL_3></FormLabel>
                            <FormControl>
                                <<COMPONENTE_3> placeholder="" type="text" {...field} />
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

---

## Template con Layout Responsive

```typescript
export default function <ENTIDAD>Form({ data }: <ENTIDAD>FormProps) {
    // ... setup igual

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-auto py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Campo 1 - 66% desktop */}
                    <div className="sm:col-span-1 lg:col-span-8">
                        <FormField
                            control={form.control}
                            name="<CAMPO_1>"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel><LABEL_1></FormLabel>
                                    <FormControl>
                                        <<COMPONENTE_1> {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Campo 2 - 33% desktop */}
                    <div className="sm:col-span-1 lg:col-span-4">
                        <FormField
                            control={form.control}
                            name="<CAMPO_2>"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel><LABEL_2></FormLabel>
                                    <FormControl>
                                        <<COMPONENTE_2> {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Campo 3 - 100% ancho */}
                    <div className="sm:col-span-2 lg:col-span-12">
                        <FormField
                            control={form.control}
                            name="<CAMPO_3>"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel><LABEL_3></FormLabel>
                                    <FormControl>
                                        <<COMPONENTE_3> {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

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

---

## Mapeo de Tipos a Componentes

### Tipos Zod → Componentes

| Tipo Campo | Schema Zod | defaultValues | Componente | Props |
|------------|-----------|---------------|------------|-------|
| String | `z.string().min(2)` | `\|\| ""` | `Input` | `type="text"` |
| String opcional | `z.string().optional()` | `\|\| ""` | `Input` | `type="text"` |
| Number | `z.number()` | Sin fallback | `InputNumber` | `onChange={(v) => field.onChange(v)}` |
| Number opcional | `z.number().optional()` | Sin fallback | `InputNumber` | `onChange={(v) => field.onChange(v)}` |
| Money | `z.number().optional()` | Sin fallback | `InputMoney` | `value={field.value} onChange={(v) => field.onChange(v)}` |
| FK (ID) | `z.number().optional()` | Sin `\|\| 0` | Selector | `value={data?.relacion} onChange={(r) => field.onChange(r.id)}` |
| Boolean | `z.boolean().optional()` | `?? true` | `Checkbox` | `checked={field.value} onCheckedChange={field.onChange}` |
| Date | `z.date().optional()` | `? new Date(...) : undefined` | `DatePicker` | `label="..." form={form} name="..."` |
| Textarea | `z.string().optional()` | `\|\| ""` | `Textarea` | - |

---

## Ejemplo Completado: Proveedor

### Input
```
Entidad: Proveedor
Campos:
- razonSocial (string requerido)
- nombreFantasia (string opcional)
- cuit (string opcional)
```

### Template Aplicado

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Proveedor } from "@/types"
import { useCreateProveedorMutation, useEditProveedorMutation } from '@/hooks/proveedor'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { LoadingButton } from "@/components/ui/loading-button"

const formSchema = z.object({
    id: z.number().optional(),
    razonSocial: z.string({ message: 'Requerido' }).min(2),
    nombreFantasia: z.string().optional(),
    cuit: z.string().optional(),
});

type ProveedorFormProps = {
    data?: Proveedor;
}

export default function ProveedorForm({ data }: ProveedorFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data?.id,
            razonSocial: data?.razonSocial || "",
            nombreFantasia: data?.nombreFantasia || "",
            cuit: data?.cuit || "",
        }
    })

    const { mutateAsync: create, isPending: isPendingCreate } = useCreateProveedorMutation()
    const { mutateAsync: edit, isPending: isPendingEdit } = useEditProveedorMutation()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (values.id) {
                await edit({ id: values.id, data: values })
            } else {
                await create(values)
            }
            toast({ description: 'Proveedor guardado', variant: 'default' })
            router.back()
        } catch (error) {
            console.error("Error al guardar proveedor", error);
            toast({ description: 'Error al guardar', variant: 'destructive' })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-auto py-10">
                <FormField
                    control={form.control}
                    name="razonSocial"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Razón Social</FormLabel>
                            <FormControl>
                                <Input placeholder="" type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="nombreFantasia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre Fantasía</FormLabel>
                            <FormControl>
                                <Input placeholder="" type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cuit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CUIT</FormLabel>
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

---

## Decisiones de Implementación

### ¿Cuándo usar layout responsive?

**SÍ** si:
- Más de 4 campos
- Campos de diferentes anchos naturales
- Formulario complejo

**NO** si:
- Formulario simple (≤4 campos)
- Todos los campos mismo ancho
- Formulario vertical es suficiente

### ¿Qué componente usar?

| Tipo de Dato | Componente |
|--------------|------------|
| Texto corto | `Input` |
| Texto largo | `Textarea` |
| Número entero | `InputNumber` |
| Dinero | `InputMoney` |
| Fecha | `DatePicker` |
| FK simple | Select Dropdown |
| FK con búsqueda | AutocompleteSelector |
| Boolean | `Checkbox` |

### ¿Cuándo poner fallback?

| Tipo | Fallback |
|------|----------|
| String | `\|\| ""` |
| Number FK | ❌ SIN fallback |
| Number normal | ❌ SIN fallback |
| Boolean | `?? true/false` |
| Date | Ternario con validación |
