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
import { CaracteristicaVisitante } from "@/types";
import {
  useCreateCaracteristicaVisitanteMutation,
  useUpdateCaracteristicaVisitanteMutation,
} from "@/hooks/caracteristica-visitante";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { cn } from "@/lib/utils";
import { IconoCaracteristica, ICONOS_POR_CATEGORIA } from "@/components/visitas/icono-caracteristica";

const TODAS_LAS_CATEGORIAS = Object.keys(ICONOS_POR_CATEGORIA);
const TODOS_LOS_ICONOS = Object.values(ICONOS_POR_CATEGORIA).flat();

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  icono: z.string({ message: "Ícono requerido" }).min(1, "Ícono requerido"),
  orden: z.coerce.number({ message: "Orden requerido" }).int().min(0),
  activo: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  defaultValues?: CaracteristicaVisitante;
}

export default function CaracteristicaVisitanteForm({ defaultValues }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [categoriaActiva, setCategoriaActiva] = React.useState(TODAS_LAS_CATEGORIAS[0]);
  const [busqueda, setBusqueda] = React.useState('');

  const { mutateAsync: create, isPending: isCreating } = useCreateCaracteristicaVisitanteMutation();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateCaracteristicaVisitanteMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      icono: defaultValues?.icono || "Dumbbell",
      orden: defaultValues?.orden ?? 0,
      activo: defaultValues?.activo ?? true,
    },
  });

  const iconoSeleccionado = form.watch('icono');

  const iconosFiltrados = busqueda
    ? TODOS_LOS_ICONOS.filter((n) => n.toLowerCase().includes(busqueda.toLowerCase()))
    : ICONOS_POR_CATEGORIA[categoriaActiva] ?? [];

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as CaracteristicaVisitante });
      } else {
        await create(values as CaracteristicaVisitante);
      }
      toast({ title: isEditing ? "Característica actualizada" : "Característica creada" });
      router.push("/visitas/caracteristicas-visitante");
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Musculoso/a" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orden"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Picker de ícono */}
        <FormField
          control={form.control}
          name="icono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícono *</FormLabel>
              <div className="space-y-3">
                {/* Preview */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 border-2 border-primary rounded-xl bg-primary/5">
                    <IconoCaracteristica nombre={iconoSeleccionado} className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">{iconoSeleccionado}</span>
                </div>

                {/* Buscador */}
                <Input
                  placeholder="Buscar ícono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="max-w-xs"
                />

                {/* Tabs de categorías */}
                {!busqueda && (
                  <div className="flex flex-wrap gap-1.5">
                    {TODAS_LAS_CATEGORIAS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoriaActiva(cat)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                          categoriaActiva === cat
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grid de íconos */}
                <div className="grid grid-cols-10 gap-1 p-3 border rounded-xl bg-muted/30 max-h-48 overflow-y-auto">
                  {iconosFiltrados.map((nombre) => (
                    <button
                      key={nombre}
                      type="button"
                      title={nombre}
                      onClick={() => field.onChange(nombre)}
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-lg transition-all',
                        'hover:bg-primary/10 hover:scale-110',
                        field.value === nombre
                          ? 'bg-primary/20 ring-2 ring-primary scale-110'
                          : ''
                      )}
                    >
                      <IconoCaracteristica nombre={nombre} className="h-5 w-5" />
                    </button>
                  ))}
                  {iconosFiltrados.length === 0 && (
                    <p className="col-span-10 text-xs text-muted-foreground text-center py-4">
                      Sin resultados
                    </p>
                  )}
                </div>
              </div>
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
          <Button type="button" variant="outline" onClick={() => router.push("/visitas/caracteristicas-visitante")}>
            Cancelar
          </Button>
          <LoadingButton type="submit" loading={isCreating || isUpdating}>
            {isEditing ? "Actualizar" : "Crear"}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
