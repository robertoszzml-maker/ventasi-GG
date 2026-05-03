'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMovimientoCajaMutation } from '@/hooks/movimiento-caja';
import { useGetConceptosMovimientoActivosQuery } from '@/hooks/concepto-movimiento';
import { MovimientoCaja } from '@/types';
import { toast } from 'sonner';

interface Props {
  sesionCajaId: number;
  onClose: () => void;
}

export default function NuevoMovimientoModal({ sesionCajaId, onClose }: Props) {
  const { data: conceptos } = useGetConceptosMovimientoActivosQuery();
  const crearMovimiento = useCreateMovimientoCajaMutation();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<MovimientoCaja>({
    defaultValues: { sesionCajaId, tipo: 'egreso', monto: '' },
  });

  const conceptoSeleccionado = watch('conceptoMovimientoId');

  const onSubmit = async (data: MovimientoCaja) => {
    try {
      await crearMovimiento.mutateAsync(data);
      toast.success('Movimiento registrado');
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al registrar movimiento');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Concepto</Label>
            <Select onValueChange={(v) => setValue('conceptoMovimientoId', parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un concepto..." />
              </SelectTrigger>
              <SelectContent>
                {conceptos?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre} ({c.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select onValueChange={(v) => setValue('tipo', v as 'ingreso' | 'egreso')} defaultValue="egreso">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="egreso">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('monto', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Detalle del movimiento..."
              {...register('descripcion')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || crearMovimiento.isPending}>Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
