'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lock, AlertTriangle } from 'lucide-react';
import { useGetSesionCajaActivaQuery, useCerrarCajaMutation } from '@/hooks/sesion-caja';
import { useGetArqueosCajaQuery } from '@/hooks/arqueo-caja';
import { CerrarCajaDto } from '@/types';
import { toast } from 'sonner';

export default function CierreCajaPage() {
  const router = useRouter();
  const { data: sesion } = useGetSesionCajaActivaQuery();
  const { data: arqueos } = useGetArqueosCajaQuery({
    filter: sesion ? JSON.stringify({ sesionCajaId: sesion.id, tipo: 'cierre' }) : undefined,
    limit: 1,
  });
  const cerrarCaja = useCerrarCajaMutation();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<CerrarCajaDto>();

  const tieneArqueoCierre = arqueos && arqueos.length > 0;

  const onSubmit = async (data: CerrarCajaDto) => {
    if (!sesion?.id) return;
    try {
      await cerrarCaja.mutateAsync({ id: sesion.id, dto: data });
      toast.success('Caja cerrada correctamente');
      router.push('/cajas');
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al cerrar la caja');
    }
  };

  if (!sesion) {
    return (
      <div className="p-6">
        <PageTitle title="Cerrar Caja" />
        <p className="mt-4 text-muted-foreground">No hay sesión activa.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Cerrar Caja" />

      {!tieneArqueoCierre && (
        <Card className="border-amber-200 bg-amber-50 max-w-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Arqueo de cierre requerido</p>
                <p className="text-sm text-amber-700 mt-1">
                  Debés completar un arqueo de cierre antes de poder cerrar la caja.
                </p>
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={() => router.push('/cajas/arqueo/nuevo?tipo=cierre')}
                >
                  Hacer arqueo de cierre
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tieneArqueoCierre && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirmar cierre de sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-green-50 rounded-md p-3 text-sm text-green-800">
                ✓ Arqueo de cierre completado. Podés cerrar la caja.
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas del cierre..."
                  {...register('observaciones')}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting || cerrarCaja.isPending}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Cerrar Caja
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
