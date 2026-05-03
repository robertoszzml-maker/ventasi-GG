"use client"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Vendedor } from '@/types'
import { useCreateVendedorMutation, useEditVendedorMutation } from '@/hooks/vendedor'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { LoadingButton } from '@/components/ui/loading-button'

const formSchema = z.object({
    id: z.number().optional(),
    nombre: z.string({ message: 'Requerido' }).min(1, 'Nombre requerido'),
    apellido: z.string({ message: 'Requerido' }).min(1, 'Apellido requerido'),
    dni: z.string().optional(),
    codigo: z.string({ message: 'Requerido' }).min(1, 'Código requerido'),
    activo: z.boolean().default(true),
})

type VendedorFormProps = {
    data?: Vendedor
}

export default function VendedorForm({ data }: VendedorFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const { mutateAsync: create, isPending: isPendingCreate } = useCreateVendedorMutation()
    const { mutateAsync: edit, isPending: isPendingEdit } = useEditVendedorMutation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data?.id,
            nombre: data?.nombre || '',
            apellido: data?.apellido || '',
            dni: data?.dni || '',
            codigo: data?.codigo || '',
            activo: data?.activo !== undefined ? !!data.activo : true,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload = { ...values, activo: values.activo ? 1 : 0 }
            if (values.id) {
                await edit({ id: values.id, data: payload as Partial<Vendedor> })
            } else {
                await create(payload as Vendedor)
            }
            toast({ description: 'Guardado correctamente', variant: 'default' })
            router.back()
        } catch (error) {
            console.error('Error', error)
            toast({ description: 'Error al guardar', variant: 'destructive' })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Juan" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: García" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="codigo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: VND001" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dni"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>DNI</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: 30123456" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="activo"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="!mt-0">Activo</FormLabel>
                        </FormItem>
                    )}
                />

                <div className="flex gap-2">
                    <LoadingButton loading={isPendingCreate || isPendingEdit} type="submit">
                        Guardar
                    </LoadingButton>
                    <Button type="button" onClick={() => router.back()} variant="link">
                        Volver
                    </Button>
                </div>
            </form>
        </Form>
    )
}
