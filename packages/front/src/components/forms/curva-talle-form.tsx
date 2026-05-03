"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurvaTalle } from "@/types";
import {
  useCreateCurvasTalleMutation,
  useEditCurvasTalleMutation,
} from "@/hooks/curvas-talle";
import { useGetTallesQuery } from "@/hooks/talles";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { X } from "lucide-react";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  talleIds: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CurvaTalleFormProps {
  defaultValues?: CurvaTalle;
}

export default function CurvaTalleForm({ defaultValues }: CurvaTalleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const { data: talles = [] } = useGetTallesQuery({
    pagination: { pageIndex: 0, pageSize: 200 },
    sorting: [{ id: "orden", desc: false }],
  });

  const { mutateAsync: create, isPending: isCreating } =
    useCreateCurvasTalleMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useEditCurvasTalleMutation();

  const talleIdsIniciales =
    defaultValues?.talleIds ??
    defaultValues?.detalles?.map((d) => d.talleId) ??
    defaultValues?.talles?.map((t) => t.id!) ??
    [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      descripcion: defaultValues?.descripcion || "",
      talleIds: talleIdsIniciales,
    },
  });

  const selectedTalleIds = form.watch("talleIds");

  const toggleTalle = (talleId: number) => {
    const current = form.getValues("talleIds");
    if (current.includes(talleId)) {
      form.setValue("talleIds", current.filter((id) => id !== talleId));
    } else {
      form.setValue("talleIds", [...current, talleId]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as CurvaTalle });
      } else {
        await create(values as CurvaTalle);
      }
      toast({ title: isEditing ? "Curva actualizada" : "Curva creada" });
      router.push("/curvas-talle");
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <Input placeholder="Ej: Talles estándar adulto" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <Textarea placeholder="Descripción opcional" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="talleIds"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>
                  Talles{" "}
                  <span className="text-muted-foreground font-normal">
                    ({selectedTalleIds.length} de {talles.length} seleccionados)
                  </span>
                </FormLabel>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => form.setValue("talleIds", talles.map((t) => t.id!))}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => form.setValue("talleIds", [])}
                    disabled={selectedTalleIds.length === 0}
                  >
                    Ninguno
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border rounded-lg p-3 bg-muted/20 min-h-16">
                {talles.map((talle) => {
                  const seleccionado = selectedTalleIds.includes(talle.id!);
                  return (
                    <button
                      key={talle.id}
                      type="button"
                      onClick={() => toggleTalle(talle.id!)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                        seleccionado
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border hover:border-primary/60 hover:bg-primary/5"
                      }`}
                    >
                      <span className="font-mono font-semibold">{talle.codigo}</span>
                      {talle.nombre && talle.nombre !== talle.codigo && (
                        <span className={`text-xs ${seleccionado ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {talle.nombre}
                        </span>
                      )}
                    </button>
                  );
                })}
                {talles.length === 0 && (
                  <p className="text-sm text-muted-foreground p-1">
                    No hay talles cargados. Creá talles desde Maestros → Talles.
                  </p>
                )}
              </div>

              {selectedTalleIds.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                    Orden en la curva
                  </p>
                  <div className="flex flex-wrap items-center gap-1">
                    {talles
                      .filter((t) => selectedTalleIds.includes(t.id!))
                      .map((t, i, arr) => (
                        <div key={t.id} className="flex items-center gap-1">
                          <div className="flex items-center gap-1 bg-muted rounded-md px-2.5 py-1 group">
                            <span className="font-mono text-sm font-semibold">{t.codigo}</span>
                            <button
                              type="button"
                              onClick={() => toggleTalle(t.id!)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          {i < arr.length - 1 && (
                            <span className="text-muted-foreground">›</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/curvas-talle")}>
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
