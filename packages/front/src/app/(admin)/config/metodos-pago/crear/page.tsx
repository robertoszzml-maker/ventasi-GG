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
import { useCreateMedioPagoMutation } from '@/hooks/medio-pago';
import { useToast } from '@/hooks/use-toast';
import { TipoCobro, MarcaTarjeta, ProcesadorPago } from '@/types';

const schema = z.object({
  codigo: z.string().min(2).max(4).regex(/^[A-Z0-9]+$/, 'Solo letras mayúsculas y números'),
  nombre: z.string().min(2),
  tipo: z.string().min(1),
  cuotas: z.coerce.number().int().min(1),
  marcaTarjeta: z.string().optional(),
  procesador: z.string().optional(),
  orden: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

const TIPOS: { value: TipoCobro; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'DEBITO', label: 'Débito' },
  { value: 'CREDITO', label: 'Crédito' },
  { value: 'QR', label: 'QR' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'APP_DELIVERY', label: 'App Delivery' },
];

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

export default function CrearMedioPagoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: crear, isPending } = useCreateMedioPagoMutation();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cuotas: 1, orden: 0 },
  });

  const tipo = watch('tipo');
  const esTarjeta = tipo === 'CREDITO' || tipo === 'DEBITO';

  const onSubmit = (data: FormData) => {
    crear(
      {
        codigo: data.codigo.toUpperCase(),
        nombre: data.nombre,
        tipo: data.tipo as TipoCobro,
        cuotas: data.cuotas,
        marcaTarjeta: esTarjeta && data.marcaTarjeta ? (data.marcaTarjeta as MarcaTarjeta) : undefined,
        procesador: data.procesador ? (data.procesador as ProcesadorPago) : undefined,
        orden: data.orden,
      },
      {
        onSuccess: () => {
          toast({ description: 'Medio de pago creado' });
          router.push('/config/metodos-pago');
        },
        onError: (err: any) => {
          toast({ description: err?.message ?? 'Error al crear', variant: 'destructive' });
        },
      },
    );
  };

  return (
    <div className="space-y-6 pb-8 max-w-lg">
      <PageTitle title="Nuevo medio de pago" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Código *</Label>
            <Input
              {...register('codigo')}
              placeholder="V3"
              maxLength={4}
              className="font-mono uppercase tracking-widest"
              onChange={(e) => setValue('codigo', e.target.value.toUpperCase())}
            />
            {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            <p className="text-xs text-muted-foreground">2-4 caracteres · único · no reutilizable</p>
          </div>

          <div className="space-y-1.5">
            <Label>Orden</Label>
            <Input type="number" min={0} {...register('orden')} placeholder="0" />
            <p className="text-xs text-muted-foreground">Posición en la grilla de botones</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Nombre *</Label>
          <Input {...register('nombre')} placeholder="Visa crédito 3 cuotas Clover" />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select onValueChange={(v) => setValue('tipo', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Cuotas</Label>
            <Input type="number" min={1} {...register('cuotas')} placeholder="1" />
            <p className="text-xs text-muted-foreground">1 si es pago único</p>
          </div>
        </div>

        {esTarjeta && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Marca de tarjeta</Label>
              <Select onValueChange={(v) => setValue('marcaTarjeta', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {MARCAS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Procesador</Label>
              <Select onValueChange={(v) => setValue('procesador', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {PROCESADORES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!esTarjeta && tipo && (
          <div className="space-y-1.5">
            <Label>Procesador (opcional)</Label>
            <Select onValueChange={(v) => setValue('procesador', v)}>
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
            {isPending ? 'Guardando…' : 'Crear medio'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
