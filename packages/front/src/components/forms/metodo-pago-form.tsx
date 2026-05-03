"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'
import { MetodoPago, CuotaMetodoPago } from '@/types'
import {
    useCreateMetodoPagoMutation,
    useEditMetodoPagoMutation,
    useAddCuotaMutation,
    useEditCuotaMutation,
    useRemoveCuotaMutation,
} from '@/hooks/metodo-pago'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { LoadingButton } from '@/components/ui/loading-button'

const formSchema = z.object({
    id: z.number().optional(),
    nombre: z.string({ message: 'Requerido' }).min(1, 'Nombre requerido'),
    tipo: z.enum(['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'qr', 'otro']),
    activo: z.boolean().default(true),
})

function CuotaRow({ cuota, metodoPagoId }: { cuota: CuotaMetodoPago; metodoPagoId: number }) {
    const [editing, setEditing] = React.useState(false)
    const [tasa, setTasa] = React.useState(cuota.tasaInteres ?? '0')
    const { mutate: editarCuota } = useEditCuotaMutation()
    const { mutate: eliminarCuota } = useRemoveCuotaMutation()
    const { toast } = useToast()

    const guardar = () => {
        editarCuota(
            { cuotaId: cuota.id!, data: { tasaInteres: tasa, activo: cuota.activo } },
            {
                onSuccess: () => { toast({ description: 'Cuota actualizada' }); setEditing(false) },
                onError: () => toast({ description: 'Error al actualizar cuota', variant: 'destructive' }),
            },
        )
    }

    return (
        <tr className="border-b last:border-0">
            <td className="py-2 px-3 text-sm">{cuota.cantidadCuotas}x</td>
            <td className="py-2 px-3">
                {editing ? (
                    <Input
                        className="h-7 w-24 text-sm"
                        value={tasa}
                        onChange={(e) => setTasa(e.target.value)}
                        onBlur={guardar}
                        onKeyDown={(e) => e.key === 'Enter' && guardar()}
                        autoFocus
                    />
                ) : (
                    <span className="text-sm cursor-pointer hover:underline" onClick={() => setEditing(true)}>
                        {cuota.tasaInteres ?? '0'}%
                    </span>
                )}
            </td>
            <td className="py-2 px-3">
                <Badge variant={cuota.activo ? 'default' : 'secondary'} className="text-xs">
                    {cuota.activo ? 'Activa' : 'Inactiva'}
                </Badge>
            </td>
            <td className="py-2 px-3">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => eliminarCuota(cuota.id!)}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </td>
        </tr>
    )
}

function NuevaCuotaRow({ metodoPagoId, cuotasExistentes }: { metodoPagoId: number; cuotasExistentes: number[] }) {
    const [cantidad, setCantidad] = React.useState('')
    const [tasa, setTasa] = React.useState('0')
    const { mutate: addCuota, isPending } = useAddCuotaMutation()
    const { toast } = useToast()

    const agregar = () => {
        const cant = parseInt(cantidad)
        if (!cant || cant < 1) return
        if (cuotasExistentes.includes(cant)) {
            toast({ description: `Ya existe una cuota de ${cant} cuotas`, variant: 'destructive' })
            return
        }
        addCuota(
            { metodoPagoId, data: { cantidadCuotas: cant, tasaInteres: tasa, activo: true } },
            {
                onSuccess: () => { toast({ description: 'Cuota agregada' }); setCantidad(''); setTasa('0') },
                onError: () => toast({ description: 'Error al agregar cuota', variant: 'destructive' }),
            },
        )
    }

    return (
        <tr>
            <td className="py-2 px-3">
                <Input className="h-7 w-20 text-sm" type="number" min="1" placeholder="Cant." value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            </td>
            <td className="py-2 px-3">
                <Input className="h-7 w-24 text-sm" placeholder="0" value={tasa} onChange={(e) => setTasa(e.target.value)} />
            </td>
            <td className="py-2 px-3" />
            <td className="py-2 px-3">
                <LoadingButton size="sm" variant="outline" className="h-7" loading={isPending} onClick={agregar} type="button">
                    <Plus className="h-3.5 w-3.5" />
                </LoadingButton>
            </td>
        </tr>
    )
}

type MetodoPagoFormProps = {
    data?: MetodoPago
}

export default function MetodoPagoForm({ data }: MetodoPagoFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const { mutateAsync: create, isPending: isPendingCreate } = useCreateMetodoPagoMutation()
    const { mutateAsync: edit, isPending: isPendingEdit } = useEditMetodoPagoMutation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data?.id,
            nombre: data?.nombre || '',
            tipo: (data?.tipo as z.infer<typeof formSchema>['tipo']) ?? 'efectivo',
            activo: data?.activo !== undefined ? !!data.activo : true,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload = { ...values, activo: values.activo ? 1 : 0 }
            if (values.id) {
                await edit({ id: values.id, data: payload as Partial<MetodoPago> })
            } else {
                await create(payload as MetodoPago)
            }
            toast({ description: 'Guardado correctamente', variant: 'default' })
            router.back()
        } catch (error) {
            console.error('Error', error)
            toast({ description: 'Error al guardar', variant: 'destructive' })
        }
    }

    const cuotasExistentes = (data?.cuotas ?? []).map((c) => c.cantidadCuotas)

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
                                    <Input placeholder="Ej: Efectivo, Visa, Naranja" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="tarjeta_debito">Tarjeta débito</SelectItem>
                                        <SelectItem value="tarjeta_credito">Tarjeta crédito</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="qr">QR / Billetera digital</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
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

                {data?.id && (
                    <div>
                        <p className="text-sm font-medium mb-2">Cuotas e intereses</p>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="py-2 px-3 text-left font-medium text-xs">Cuotas</th>
                                        <th className="py-2 px-3 text-left font-medium text-xs">Tasa (%)</th>
                                        <th className="py-2 px-3 text-left font-medium text-xs">Estado</th>
                                        <th className="py-2 px-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data.cuotas ?? []).map((c) => (
                                        <CuotaRow key={c.id} cuota={c} metodoPagoId={data.id!} />
                                    ))}
                                    <NuevaCuotaRow metodoPagoId={data.id!} cuotasExistentes={cuotasExistentes} />
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Hacé clic en la tasa para editarla en línea</p>
                    </div>
                )}

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
