'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetSesionCajaActivaQuery } from '@/hooks/sesion-caja';
import { useCreateArqueoCajaMutation } from '@/hooks/arqueo-caja';
import { ArqueoCaja } from '@/types';
import { formatMoney } from '@/utils/number';
import { toast } from 'sonner';

export default function NuevoArqueoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const esCierre = searchParams.get('tipo') === 'cierre';

  const { data: sesion } = useGetSesionCajaActivaQuery();
  const crearArqueo = useCreateArqueoCajaMutation();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<any>({
    defaultValues: { tipo: esCierre ? 'cierre' : 'parcial', observaciones: '' },
  });

  if (!sesion) {
    return (
      <div className="p-6">
        <PageTitle title="Arqueo de Caja" />
        <p className="mt-4 text-muted-foreground">No hay sesión activa.</p>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    try {
      const detalles = [];
      const keys = Object.keys(data).filter(k => k.startsWith('monto_'));
      for (const key of keys) {
        const medioPagoId = parseInt(key.replace('monto_', ''));
        detalles.push({ medioPagoId, montoDeclarado: data[key] || '0' });
      }

      const payload: ArqueoCaja = {
        sesionCajaId: sesion.id!,
        tipo: data.tipo,
        observaciones: data.observaciones,
        detalles,
      };

      await crearArqueo.mutateAsync(payload);
      toast.success('Arqueo registrado');

      if (esCierre) {
        router.push('/cajas/cierre');
      } else {
        router.push('/cajas/sesion');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al crear arqueo');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitle title={esCierre ? 'Arqueo de Cierre' : 'Arqueo Parcial'} />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Declaración de saldos por medio de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium">Ingresá el monto físico por cada medio de pago:</p>
              <p className="text-muted-foreground">El sistema calculará automáticamente la diferencia.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Efectivo</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('monto_1')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas del arqueo..."
                {...register('observaciones')}
              />
            </div>

            <input type="hidden" {...register('tipo')} value={esCierre ? 'cierre' : 'parcial'} />

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting || crearArqueo.isPending}>
                {esCierre ? 'Guardar arqueo de cierre' : 'Guardar arqueo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
