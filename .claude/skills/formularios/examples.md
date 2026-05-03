# Ejemplos: Formularios Frontend

## Ejemplo 1: Formulario Simple (Proveedor)

### Comando
```
/formularios proveedor
```

### Resultado: components/forms/proveedor-form.tsx

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

## Ejemplo 2: Formulario con FK (Equipamiento)

### Tipo: types/index.d.ts
```typescript
export type Equipamiento = {
  id?: number;
  nombre: string;
  tipoId?: number;  // ✅ FK
  tipo?: EquipamientoTipo;  // ✅ Relación poblada
  anio?: string;
}
```

### Formulario con Selector

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Equipamiento } from "@/types"
import { useCreateEquipamientoMutation, useEditEquipamientoMutation } from '@/hooks/equipamiento'
import { EquipamientoTipoSelector } from "@/components/selectors/equipamiento-tipo-selector"
// ... otros imports

const formSchema = z.object({
    id: z.number().optional(),
    nombre: z.string({ message: 'Requerido' }).min(2),
    tipoId: z.number().optional(),  // ✅ FK sin fallback
    anio: z.string().optional(),
});

export default function EquipamientoForm({ data }: { data?: Equipamiento }) {
    // ... hooks

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data?.id,
            nombre: data?.nombre || "",
            tipoId: data?.tipoId,  // ✅ SIN || 0
            anio: data?.anio || "",
        }
    })

    // ... onSubmit

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

                <FormField
                    control={form.control}
                    name="tipoId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <EquipamientoTipoSelector
                                value={data?.tipo}  {/* ✅ Objeto completo */}
                                onChange={(tipo) => field.onChange(tipo.id)}  {/* ✅ Solo ID */}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="anio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Año</FormLabel>
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

## Ejemplo 3: Formulario con Layout Responsive

### Producto con Múltiples Campos

```typescript
export default function ProductoForm({ data }: { data?: Producto }) {
    // ... setup

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-auto py-10">
                {/* Grid responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Nombre - 50% en tablet, 66% en desktop */}
                    <div className="sm:col-span-1 lg:col-span-8">
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
                    </div>

                    {/* Código - 50% en tablet, 33% en desktop */}
                    <div className="sm:col-span-1 lg:col-span-4">
                        <FormField
                            control={form.control}
                            name="codigo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Precio - 50% en tablet, 33% en desktop */}
                    <div className="sm:col-span-1 lg:col-span-4">
                        <FormField
                            control={form.control}
                            name="precio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio</FormLabel>
                                    <FormControl>
                                        <InputMoney
                                            value={field.value}
                                            onChange={(value) => field.onChange(value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Stock - 50% en tablet, 33% en desktop */}
                    <div className="sm:col-span-1 lg:col-span-4">
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        <InputNumber
                                            {...field}
                                            onChange={(value) => field.onChange(value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Categoría - 50% en tablet, 33% en desktop */}
                    <div className="sm:col-span-1 lg:col-span-4">
                        <FormField
                            control={form.control}
                            name="categoriaId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <CategoriaSelector
                                        value={data?.categoria}
                                        onChange={(cat) => field.onChange(cat.id)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Descripción - 100% ancho en todos los tamaños */}
                    <div className="sm:col-span-2 lg:col-span-12">
                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="" {...field} />
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

## Comparaciones: Correcto vs Incorrecto

### ❌ Schema Incorrecto

```typescript
const formSchema = z.object({
    id: z.number(),                      // Sin .optional()
    nombre: z.string(),                  // Sin mensaje de error
    categoriaId: z.number().default(0),  // Con fallback
});
```

### ✅ Schema Correcto

```typescript
const formSchema = z.object({
    id: z.number().optional(),
    nombre: z.string({ message: 'Requerido' }).min(2),
    categoriaId: z.number().optional(),  // Sin fallback
});
```

---

### ❌ DefaultValues Incorrectos

```typescript
defaultValues: {
    id: data?.id || undefined,           // Redundante
    nombre: data?.nombre,                // Sin fallback
    categoriaId: data?.categoriaId || 0, // Con fallback
}
```

### ✅ DefaultValues Correctos

```typescript
defaultValues: {
    id: data?.id,
    nombre: data?.nombre || "",          // Con fallback para strings
    categoriaId: data?.categoriaId,      // SIN fallback para FKs
}
```

---

### ❌ Submit Incorrecto

```typescript
async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.id) {
        edit({ id: values.id, data: values })  // Sin await
    } else {
        create(values)  // Sin await
    }
    router.back()  // Ejecuta antes de que termine
}
```

### ✅ Submit Correcto

```typescript
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
```

---

### ❌ Selector con FK Incorrecto

```typescript
<FormField
    control={form.control}
    name="proveedorId"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Proveedor</FormLabel>
            <ProveedorSelector
                value={data?.proveedorId}  {/* ❌ ID en lugar de objeto */}
                onChange={field.onChange}   {/* ❌ Recibe objeto, no ID */}
            />
            <FormMessage />
        </FormItem>
    )}
/>
```

### ✅ Selector con FK Correcto

```typescript
<FormField
    control={form.control}
    name="proveedorId"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Proveedor</FormLabel>
            <ProveedorSelector
                value={data?.proveedor}  {/* ✅ Objeto completo */}
                onChange={(prov) => field.onChange(prov.id)}  {/* ✅ Solo ID */}
            />
            <FormMessage />
        </FormItem>
    )}
/>
```

---

### ❌ Botón Volver Incorrecto

```typescript
<Button type="submit" onClick={() => router.back()}>
    Volver
</Button>
```

### ✅ Botón Volver Correcto

```typescript
<Button type="button" onClick={() => router.back()} variant={"link"}>
    Volver
</Button>
```
