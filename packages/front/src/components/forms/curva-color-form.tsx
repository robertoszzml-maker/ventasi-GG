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
import { CurvaColor } from "@/types";
import {
  useCreateCurvasColorMutation,
  useEditCurvasColorMutation,
} from "@/hooks/curvas-color";
import { useGetColoresQuery } from "@/hooks/colores";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { X } from "lucide-react";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  colorIds: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CurvaColorFormProps {
  defaultValues?: CurvaColor;
}

const ColorSwatch = ({ hex, size = "md" }: { hex?: string; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";
  const style = hex
    ? { backgroundColor: hex }
    : { background: "repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)" };
  return <div className={`${dim} rounded-full border shadow-sm flex-shrink-0`} style={style} />;
};

export default function CurvaColorForm({ defaultValues }: CurvaColorFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const { data: colores = [] } = useGetColoresQuery({
    pagination: { pageIndex: 0, pageSize: 200 },
  });

  const { mutateAsync: create, isPending: isCreating } = useCreateCurvasColorMutation();
  const { mutateAsync: update, isPending: isUpdating } = useEditCurvasColorMutation();

  const colorIdsIniciales =
    defaultValues?.colorIds ??
    defaultValues?.detalles?.map((d) => d.colorId) ??
    defaultValues?.colores?.map((c) => c.id!) ??
    [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      descripcion: defaultValues?.descripcion || "",
      colorIds: colorIdsIniciales,
    },
  });

  const selectedColorIds = form.watch("colorIds");

  const toggleColor = (colorId: number) => {
    const current = form.getValues("colorIds");
    if (current.includes(colorId)) {
      form.setValue("colorIds", current.filter((id) => id !== colorId));
    } else {
      form.setValue("colorIds", [...current, colorId]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as CurvaColor });
      } else {
        await create(values as CurvaColor);
      }
      toast({ title: isEditing ? "Curva actualizada" : "Curva creada" });
      router.push("/curvas-color");
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
              <Input placeholder="Ej: Curva colores temporada" {...field} />
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
          name="colorIds"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>
                  Colores{" "}
                  <span className="text-muted-foreground font-normal">
                    ({selectedColorIds.length} de {colores.length} seleccionados)
                  </span>
                </FormLabel>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => form.setValue("colorIds", colores.map((c) => c.id!))}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => form.setValue("colorIds", [])}
                    disabled={selectedColorIds.length === 0}
                  >
                    Ninguno
                  </Button>
                </div>
              </div>

              {/* Grid de colores */}
              <div className="border rounded-lg p-3 bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {colores.map((color) => {
                    const seleccionado = selectedColorIds.includes(color.id!);
                    const codigos = color.codigos ?? [];
                    const hexPrimario = codigos[0]?.hex;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => toggleColor(color.id!)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-all text-left ${
                          seleccionado
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-background border-border hover:border-primary/50 hover:bg-muted/40"
                        }`}
                      >
                        {codigos.length > 1 ? (
                          <div className="flex -space-x-1 flex-shrink-0">
                            {codigos.slice(0, 3).map((c, i) => (
                              <ColorSwatch key={i} hex={c?.hex} size="md" />
                            ))}
                          </div>
                        ) : (
                          <ColorSwatch hex={hexPrimario} size="md" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{color.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{color.codigo}</p>
                          {color.descripcion && (
                            <p className="text-xs text-muted-foreground truncate">{color.descripcion}</p>
                          )}
                        </div>
                        {seleccionado && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {colores.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full p-1">
                      No hay colores cargados. Creá colores desde Maestros → Colores.
                    </p>
                  )}
                </div>
              </div>

              {/* Preview de colores seleccionados */}
              {selectedColorIds.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                    Orden en la curva
                  </p>
                  <div className="flex flex-wrap items-center gap-1">
                    {colores
                      .filter((c) => selectedColorIds.includes(c.id!))
                      .map((c, i, arr) => {
                        const codigos = c.codigos ?? [];
                        const hexPrimario = codigos[0]?.hex;
                        return (
                          <div key={c.id} className="flex items-center gap-1">
                            <div className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1.5 group">
                              {codigos.length > 1 ? (
                                <div className="flex -space-x-1">
                                  {codigos.slice(0, 3).map((cod, idx) => (
                                    <ColorSwatch key={idx} hex={cod?.hex} size="sm" />
                                  ))}
                                </div>
                              ) : (
                                <ColorSwatch hex={hexPrimario} size="sm" />
                              )}
                              <span className="text-sm font-medium">{c.nombre}</span>
                              <button
                                type="button"
                                onClick={() => toggleColor(c.id!)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            {i < arr.length - 1 && (
                              <span className="text-muted-foreground">›</span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/curvas-color")}>
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
