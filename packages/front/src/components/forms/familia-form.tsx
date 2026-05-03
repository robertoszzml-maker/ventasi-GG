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
import { Familia } from "@/types";
import {
  useCreateFamiliasMutation,
  useEditFamiliasMutation,
} from "@/hooks/familias";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { SILUETAS, SiluetaSvg, TipoSilueta } from "@/components/stock/siluetas";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  silueta: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FamiliaFormProps {
  defaultValues?: Familia;
}

export default function FamiliaForm({ defaultValues }: FamiliaFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const { mutateAsync: create, isPending: isCreating } =
    useCreateFamiliasMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useEditFamiliasMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      silueta: defaultValues?.silueta || "",
    },
  });

  const siluetaSeleccionada = form.watch("silueta");

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as Familia });
      } else {
        await create(values as Familia);
      }
      toast({ title: isEditing ? "Familia actualizada" : "Familia creada" });
      router.push("/familias");
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
              <FormControl>
                <Input placeholder="Nombre de la familia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="silueta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Silueta / Tipo de prenda</FormLabel>
              <p className="text-xs text-muted-foreground -mt-1 mb-3">
                Seleccioná una silueta para visualizar las combinaciones de color en los artículos de esta familia.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => field.onChange("")}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                    !field.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center text-2xl text-muted-foreground">
                    —
                  </div>
                  <span className="text-xs text-center font-medium text-muted-foreground">Ninguna</span>
                </button>

                {SILUETAS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => field.onChange(s.value)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                      field.value === s.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <SiluetaSvg
                      tipo={s.value as TipoSilueta}
                      color={field.value === s.value ? "hsl(var(--primary))" : "#94a3b8"}
                      size={48}
                    />
                    <span className={`text-xs text-center font-medium ${field.value === s.value ? "text-primary" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {siluetaSeleccionada && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
              Preview — así se verán los colores del artículo
            </p>
            <div className="flex gap-3 flex-wrap">
              {["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"].map((hex) => (
                <div key={hex} className="flex flex-col items-center gap-1">
                  <SiluetaSvg
                    tipo={siluetaSeleccionada as TipoSilueta}
                    color={hex}
                    size={48}
                  />
                  <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: hex }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/familias")}
          >
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
