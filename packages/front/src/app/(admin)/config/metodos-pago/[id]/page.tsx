'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMediosPagoQuery, useEditMedioPagoMutation } from '@/hooks/medio-pago';
import { useToast } from '@/hooks/use-toast';
import { MarcaTarjeta, ProcesadorPago } from '@/types';

const schema = z.object({
  nombre: z.string().min(2),
  cuotas: z.coerce.number().int().min(1),
  marcaTarjeta: z.string().optional(),
  procesador: z.string().optional(),
  orden: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

const MARCAS: { value: MarcaTarjeta; label: string }[] = [
  { value: 'VISA', label: 'VISA' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'AMEX', label: 'Amex' },
  { value: 'CABAL', label: 'Cabal' },
  { value: 'NARANJA', label: 'Naranja' },
  { value: 'OTRA', label: 'Otra' },
];

const PROCESADORES: { value: ProcesadorPago; label: string }[] = [
  { value: 'CLOVER', label: 'Clover' },
  { value: 'MP', label: 'MercadoPago' },
  { value: 'OTRO', label: 'Otro' },
];

export default function EditarMedioPagoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: editar, isPending } = useEditMedioPagoMutation();

  const { data: medios = [], isLoading } = useGetMediosPagoQuery({ pagination: { pageIndex: 0, pageSize: 200 } });
  const medio = medios.find((m) => String(m.id) === id);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cuotas: 1, orden: 0 },
  });

  React.useEffect(() => {
    if (medio) {
      reset({
        nombre: medio.nombre,
        cuotas: medio.cuotas,
        marcaTarjeta: medio.marcaTarjeta ?? '',
        procesador: medio.procesador ?? '',
        orden: medio.orden,
      });
    }
  }, [medio]);

  const esTarjeta = medio?.tipo === 'CREDITO' || medio?.tipo === 'DEBITO';

  const onSubmit = (data: FormData) => {
    editar(
      {
        id: parseInt(id),
        data: {
          nombre: data.nombre,
          cuotas: data.cuotas,
          marcaTarjeta: data.marcaTarjeta ? (data.marcaTarjeta as MarcaTarjeta) : undefined,
          procesador: data.procesador ? (data.procesador as ProcesadorPago) : undefined,
          orden: data.orden,
        },
      },
      {
        onSuccess: () => {
          toast({ description: 'Medio actualizado' });
          router.push('/config/metodos-pago');
        },
        onError: () => toast({ description: 'Error al actualizar', variant: 'destructive' }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!medio) return <p className="text-muted-foreground">Medio de pago no encontrado.</p>;

  return (
    <div className="space-y-6 pb-8 max-w-lg">
      <PageTitle title={`Editar: ${medio.codigo} — ${medio.nombre}`} />

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm space-y-1">
        <div className="flex gap-3">
          <span className="text-muted-foreground w-20">Código</span>
          <span className="font-mono font-bold">{medio.codigo}</span>
          <span className="text-xs text-muted-foreground">(no editable)</span>
        </div>
        <div className="flex gap-3">
          <span className="text-muted-foreground w-20">Tipo</span>
          <span>{medio.tipo}</span>
          <span className="text-xs text-muted-foreground">(no editable)</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nombre *</Label>
          <Input {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Cuotas</Label>
            <Input type="number" min={1} {...register('cuotas')} />
          </div>
          <div className="space-y-1.5">
            <Label>Orden</Label>
            <Input type="number" min={0} {...register('orden')} />
            <p className="text-xs text-muted-foreground">Posición en la grilla</p>
          </div>
        </div>

        {esTarjeta && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Select
                defaultValue={medio.marcaTarjeta ?? ''}
                onValueChange={(v) => setValue('marcaTarjeta', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MARCAS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Procesador</Label>
              <Select
                defaultValue={medio.procesador ?? ''}
                onValueChange={(v) => setValue('procesador', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROCESADORES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!esTarjeta && (
          <div className="space-y-1.5">
            <Label>Procesador (opcional)</Label>
            <Select
              defaultValue={medio.procesador ?? ''}
              onValueChange={(v) => setValue('procesador', v)}
            >
              <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
              <SelectContent>
                {PROCESADORES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
