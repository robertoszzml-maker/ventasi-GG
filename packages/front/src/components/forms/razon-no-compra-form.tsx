"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RazonNoCompra, SubRazonNoCompra } from "@/types";
import {
  useCreateRazonNoCompraMutation,
  useUpdateRazonNoCompraMutation,
  useCreateSubRazonMutation,
  useUpdateSubRazonMutation,
  useGetRazonByIdQuery,
} from "@/hooks/razon-no-compra";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Pencil } from "lucide-react";
import React from "react";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  activo: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function RazonNoCompraForm({ defaultValues }: { defaultValues?: RazonNoCompra }) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const { mutateAsync: create, isPending: isCreating } = useCreateRazonNoCompraMutation();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateRazonNoCompraMutation();
  const { mutateAsync: crearSubRazon, isPending: creandoSub } = useCreateSubRazonMutation();
  const { mutateAsync: actualizarSubRazon } = useUpdateSubRazonMutation();

  // Query directa para sub-razones — se actualiza automáticamente tras invalidación
  const { data: razonActual } = useGetRazonByIdQuery(defaultValues?.id ?? 0);
  const subRazones: SubRazonNoCompra[] = razonActual?.subRazones ?? defaultValues?.subRazones ?? [];

  const [nuevaSub, setNuevaSub] = React.useState('');
  const [editandoSub, setEditandoSub] = React.useState<{ id: number; nombre: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      activo: defaultValues?.activo ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as RazonNoCompra });
      } else {
        await create(values as RazonNoCompra);
      }
      toast({ title: isEditing ? "Razón actualizada" : "Razón creada" });
      router.push("/visitas/razones-no-compra");
    } catch (e: any) {
      toast({ title: e?.message ?? "Error al guardar", variant: "destructive" });
    }
  };

  const handleCrearSubRazon = async () => {
    if (!nuevaSub.trim() || !defaultValues?.id) return;
    try {
      await crearSubRazon({ razonId: defaultValues.id, data: { nombre: nuevaSub.trim() } });
      setNuevaSub('');
      toast({ title: 'Sub-razón creada' });
    } catch {
      toast({ title: 'Error al crear sub-razón', variant: 'destructive' });
    }
  };

  const handleGuardarSubRazon = async () => {
    if (!editandoSub) return;
    try {
      await actualizarSubRazon({ id: editandoSub.id, data: { nombre: editandoSub.nombre } });
      setEditandoSub(null);
    } catch {
      toast({ title: 'Error al actualizar sub-razón', variant: 'destructive' });
    }
  };

  const handleToggleActivoSub = async (s: SubRazonNoCompra) => {
    try {
      await actualizarSubRazon({ id: s.id!, data: { activo: !s.activo } });
    } catch {
      toast({ title: 'Error al cambiar estado', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Precio muy alto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
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
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/visitas/razones-no-compra")}>
              Cancelar
            </Button>
            <LoadingButton type="submit" loading={isCreating || isUpdating}>
              {isEditing ? "Actualizar" : "Crear"}
            </LoadingButton>
          </div>
        </form>
      </Form>

      {/* Gestión de sub-razones — solo en modo edición */}
      {isEditing && (
        <div className="space-y-3 pt-2 border-t">
          <h3 className="font-semibold text-sm">Sub-razones</h3>

          <div className="rounded-xl border bg-card divide-y">
            {subRazones.length === 0 && (
              <p className="text-sm text-muted-foreground p-4">Sin sub-razones configuradas</p>
            )}
            {subRazones.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-4 py-2.5">
                {editandoSub?.id === s.id ? (
                  <>
                    <Input
                      value={editandoSub.nombre}
                      onChange={(e) => setEditandoSub({ ...editandoSub, nombre: e.target.value })}
                      className="flex-1 h-8 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleGuardarSubRazon()}
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleGuardarSubRazon}>
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditandoSub(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{s.nombre}</span>
                    <Badge
                      variant={s.activo ? 'outline' : 'secondary'}
                      className="cursor-pointer text-xs"
                      onClick={() => handleToggleActivoSub(s)}
                    >
                      {s.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditandoSub({ id: s.id!, nombre: s.nombre })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={nuevaSub}
              onChange={(e) => setNuevaSub(e.target.value)}
              placeholder="Nueva sub-razón..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCrearSubRazon()}
            />
            <LoadingButton
              loading={creandoSub}
              onClick={handleCrearSubRazon}
              disabled={!nuevaSub.trim()}
              type="button"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}
