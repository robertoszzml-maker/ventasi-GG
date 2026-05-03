# Referencia Técnica: Formularios Frontend

## Template Base Completo

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

---

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
**Schema:** `fecha: z.date().optional()`
**defaultValues:** `fecha: data?.fecha ? new Date(data.fecha) : undefined`

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
**defaultValues:** `proveedorId: data?.proveedorId` (solo ID)

---

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

**Breakpoints:**
- `< 640px` → móvil (100% ancho)
- `640px+` → tablet (grid 2 columnas)
- `1024px+` → desktop (grid 12 columnas)

---

## Orden de Hooks

**IMPORTANTE:** Mantener este orden exacto:

```typescript
1. useToast()
2. useRouter() from 'next/navigation'
3. useForm()
4. useCreate...Mutation()
5. useEdit...Mutation()
```

**Razón:** Hooks deben llamarse en el mismo orden en cada render.

---

## Reglas Críticas

### 1. Schema Zod

```typescript
// ✅ CORRECTO
const formSchema = z.object({
    id: z.number().optional(),           // Siempre opcional
    nombre: z.string({ message: 'Requerido' }).min(2),
    categoriaId: z.number().optional(),  // FK sin fallback
    precio: z.number().optional(),
});

// ❌ INCORRECTO
const formSchema = z.object({
    id: z.number(),                      // No opcional
    nombre: z.string(),                  // Sin mensaje
    categoriaId: z.number().default(0),  // Con fallback
});
```

### 2. DefaultValues

```typescript
// ✅ CORRECTO
defaultValues: {
    id: data?.id,
    nombre: data?.nombre || "",          // String con fallback
    categoriaId: data?.categoriaId,      // FK SIN fallback
    activo: data?.activo ?? true,        // Boolean con ??
}

// ❌ INCORRECTO
defaultValues: {
    id: data?.id || undefined,           // Redundante
    nombre: data?.nombre,                // String sin fallback
    categoriaId: data?.categoriaId || 0, // FK CON fallback
    activo: data?.activo || true,        // || en lugar de ??
}
```

### 3. Props del Componente

```typescript
// ✅ CORRECTO
type MyFormProps = {
    data?: MiEntidad;  // Opcional
}

export default function MyForm({ data }: MyFormProps) {
    // ...
}

// ❌ INCORRECTO
type MyFormProps = {
    data: MiEntidad | null;  // Null en lugar de optional
}

export default function MyForm({ data = null }: MyFormProps) {
    // Default value innecesario
}
```

### 4. Submit Handler

```typescript
// ✅ CORRECTO
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

// ❌ INCORRECTO
async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.id) {
        edit({ id: values.id, data: values })  // Sin await
    } else {
        create(values)  // Sin await
    }
    router.back()  // Sin esperar a que termine
}
```

### 5. LoadingButton

```typescript
// ✅ CORRECTO
<LoadingButton loading={isPendingCreate || isPendingEdit} type="submit">
    Guardar
</LoadingButton>

// ❌ INCORRECTO
<LoadingButton loading={isPending} type="submit">  // isPending no existe
    Guardar
</LoadingButton>

<Button type="submit">  // Sin loading state
    Guardar
</Button>
```

### 6. Botón Volver

```typescript
// ✅ CORRECTO
<Button type="button" onClick={() => router.back()} variant={"link"}>
    Volver
</Button>

// ❌ INCORRECTO
<Button type="submit" onClick={() => router.back()}>  // type submit
    Volver
</Button>

<Button onClick={() => router.back()}>  // Sin type
    Volver
</Button>
```

---

## Anti-patrones

```typescript
// ❌ NO
categoriaId: data?.categoriaId || 0      // ✅ Sin fallback
data.nombre                              // ✅ usar data?.nombre
const { isPending } = useCreate...()     // ✅ usar isPendingCreate
<Button type="submit">Volver</Button>    // ✅ type="button"
useRouter() from 'next/router'           // ✅ 'next/navigation'

// ✅ SÍ
categoriaId: data?.categoriaId
data?.nombre || ""
isPendingCreate || isPendingEdit
type="button" en Volver
useRouter() from 'next/navigation'
```

---

## Checklist Completo

### Estructura
- [ ] `"use client"` al inicio
- [ ] Archivo en `components/forms/[entidad]-form.tsx`

### Imports
- [ ] useForm, zodResolver, z
- [ ] Componentes UI necesarios
- [ ] Tipo de `@/types`
- [ ] Hooks de `@/hooks/[entidad]`
- [ ] useToast, useRouter, LoadingButton

### Schema
- [ ] `id: z.number().optional()`
- [ ] Mensajes de error en validaciones
- [ ] FKs sin `.default(0)`
- [ ] Tipos correctos para cada campo

### Props
- [ ] `data?: Tipo` (opcional)
- [ ] TypeScript type definido

### defaultValues
- [ ] Strings con `|| ""`
- [ ] FKs sin `|| 0`
- [ ] Booleans con `??`
- [ ] Fechas con validación ternaria

### Hooks (en orden)
- [ ] useToast()
- [ ] useRouter() from 'next/navigation'
- [ ] useForm()
- [ ] useCreate...Mutation() con isPendingCreate
- [ ] useEdit...Mutation() con isPendingEdit

### Submit
- [ ] `if (values.id)` para editar
- [ ] `else` para crear
- [ ] toast de éxito
- [ ] router.back()
- [ ] try/catch con toast de error

### Campos
- [ ] FormField por cada campo
- [ ] FormLabel, FormControl, FormMessage
- [ ] Componente correcto según tipo
- [ ] Grid responsive si aplica

### Botones
- [ ] LoadingButton con ambos isPending
- [ ] type="submit" en LoadingButton
- [ ] type="button" en Volver
- [ ] router.back() en Volver

---

## Resumen

| Aspecto | Valor |
|---------|-------|
| Schema | `z.object({ id: z.number().optional() })` |
| Props | `data?: Tipo` |
| FKs | SIN fallback (`|| 0`) |
| Strings | `|| ""` |
| Booleans | `??` |
| onSubmit | `if (values.id)` editar, sino crear |
| Loading | `isPendingCreate \|\| isPendingEdit` |
| Router | `'next/navigation'` |
| Orden hooks | useToast → useRouter → useForm → mutations |
| Volver | `type="button"` |
