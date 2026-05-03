'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useGetConceptosMovimientoQuery,
  useCreateConceptoMovimientoMutation,
  useEditConceptoMovimientoMutation,
  useDeleteConceptoMovimientoMutation,
} from '@/hooks/concepto-movimiento';
import { ConceptoMovimiento } from '@/types';
import { toast } from 'sonner';

export default function ConceptosMovimientoPage() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<ConceptoMovimiento | null>(null);

  const { data: conceptos } = useGetConceptosMovimientoQuery({ order: JSON.stringify({ nombre: 'ASC' }) });
  const crear = useCreateConceptoMovimientoMutation();
  const editar = useEditConceptoMovimientoMutation();
  const eliminar = useDeleteConceptoMovimientoMutation();

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<ConceptoMovimiento>({
    defaultValues: { tipo: 'egreso', activo: 1 },
  });

  const onOpenCreate = () => {
    reset({ tipo: 'egreso', activo: 1 });
    setEditando(null);
    setShowForm(true);
  };

  const onOpenEdit = (c: ConceptoMovimiento) => {
    reset(c);
    setEditando(c);
    setShowForm(true);
  };

  const onSubmit = async (data: ConceptoMovimiento) => {
    try {
      if (editando?.id) {
        await editar.mutateAsync({ id: editando.id, data });
        toast.success('Concepto actualizado');
      } else {
        await crear.mutateAsync(data);
        toast.success('Concepto creado');
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al guardar');
    }
  };

  const onDelete = async (c: ConceptoMovimiento) => {
    if (!c.id || c.esSistema) return;
    if (!confirm(`¿Eliminar el concepto "${c.nombre}"?`)) return;
    try {
      await eliminar.mutateAsync(c.id);
      toast.success('Concepto eliminado');
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al eliminar');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Conceptos de Movimiento">
        <Button size="sm" onClick={onOpenCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo concepto
        </Button>
      </PageTitle>

      <div className="border rounded-lg divide-y">
        {!conceptos?.length ? (
          <p className="p-4 text-muted-foreground text-sm">No hay conceptos.</p>
        ) : conceptos.map((c: ConceptoMovimiento) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-sm">{c.nombre}</p>
                <Badge
                  variant="outline"
                  className={c.tipo === 'ingreso'
                    ? 'text-xs bg-green-50 text-green-700 border-green-200'
                    : 'text-xs bg-red-50 text-red-700 border-red-200'
                  }
                >
                  {c.tipo}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.esSistema ? (
                <Badge variant="outline" className="text-xs">Sistema</Badge>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={() => onOpenEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(c)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar concepto' : 'Nuevo concepto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...register('nombre', { required: true })} placeholder="Ej: Pago de servicio" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(v) => setValue('tipo', v as 'ingreso' | 'egreso')} defaultValue={editando?.tipo ?? 'egreso'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="egreso">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
