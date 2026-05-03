'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Unlock } from 'lucide-react';
import { useAbrirCajaMutation, useGetSesionCajaActivaQuery } from '@/hooks/sesion-caja';
import { AbrirCajaDto } from '@/types';
import { toast } from 'sonner';

export default function AperturaCajaPage() {
  const router = useRouter();
  const { data: sesionActiva } = useGetSesionCajaActivaQuery();
  const abrirCaja = useAbrirCajaMutation();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AbrirCajaDto>({
    defaultValues: {
      cajaId: 1,
      saldoInicialConfirmado: sesionActiva ? '0' : '0',
    },
  });

  const onSubmit = async (data: AbrirCajaDto) => {
    try {
      await abrirCaja.mutateAsync(data);
      toast.success('Caja abierta correctamente');
      router.push('/cajas');
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al abrir la caja');
    }
  };

  if (sesionActiva) {
    return (
      <div className="p-6">
        <PageTitle title="Abrir Caja" />
        <Card className="max-w-md mt-4">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Ya hay una sesión de caja abierta.</p>
            <Button className="mt-4" onClick={() => router.push('/cajas')}>Ir a la caja</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Abrir Caja" />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Apertura de sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="saldoInicialConfirmado">Saldo inicial en efectivo</Label>
              <Input
                id="saldoInicialConfirmado"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('saldoInicialConfirmado', { required: true })}
              />
              <p className="text-xs text-muted-foreground">
                Contá el efectivo en el cajón y confirmá el monto.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas de apertura..."
                {...register('observaciones')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || abrirCaja.isPending}>
              <Unlock className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
