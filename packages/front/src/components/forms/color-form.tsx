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
import { Textarea } from "@/components/ui/textarea";
import { Color } from "@/types";
import {
  useCreateColoresMutation,
  useEditColoresMutation,
} from "@/hooks/colores";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { Plus, X } from "lucide-react";
import React from "react";

const formSchema = z.object({
  id: z.number().optional(),
  codigo: z.string({ message: "Código requerido" }).min(1, "Código requerido"),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  codigosHex: z.array(z.string().min(4, "Hex inválido")).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
  defaultValues?: Color;
}

const ColorSwatch = ({ hex, size = "md" }: { hex: string; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7";
  return (
    <div
      className={`${dim} rounded-full border shadow-sm flex-shrink-0`}
      style={{ backgroundColor: hex }}
    />
  );
};

export default function ColorForm({ defaultValues }: ColorFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [nuevoHex, setNuevoHex] = React.useState("#000000");

  const { mutateAsync: create, isPending: isCreating } = useCreateColoresMutation();
  const { mutateAsync: update, isPending: isUpdating } = useEditColoresMutation();

  const codigosHexIniciales =
    defaultValues?.codigosHex ??
    defaultValues?.codigos?.map((c) => c.hex) ??
    [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      codigo: defaultValues?.codigo || "",
      nombre: defaultValues?.nombre || "",
      descripcion: defaultValues?.descripcion || "",
      codigosHex: codigosHexIniciales,
    },
  });

  const codigosHex = form.watch("codigosHex");
  const esTrama = codigosHex.length > 1;

  const agregarHex = () => {
    if (!nuevoHex) return;
    form.setValue("codigosHex", [...codigosHex, nuevoHex]);
    setNuevoHex("#000000");
  };

  const quitarHex = (index: number) => {
    form.setValue("codigosHex", codigosHex.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as Color });
      } else {
        await create(values as Color);
      }
      toast({ title: isEditing ? "Color actualizado" : "Color creado" });
      router.push("/colores");
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
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: ROJO-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción opcional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Códigos de color (hex) */}
        <FormField
          control={form.control}
          name="codigosHex"
          render={() => (
            <FormItem>
              <FormLabel>
                Códigos de color (hex){" "}
                {esTrama && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    — trama ({codigosHex.length} colores)
                  </span>
                )}
              </FormLabel>

              {/* Colores agregados */}
              {codigosHex.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-lg border mb-2">
                  {codigosHex.map((hex, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-background border rounded-full pl-1.5 pr-2 py-1 group">
                      <ColorSwatch hex={hex} size="sm" />
                      <span className="text-xs font-mono">{hex}</span>
                      <button
                        type="button"
                        onClick={() => quitarHex(i)}
                        className="text-muted-foreground hover:text-destructive ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar nuevo hex */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-12 cursor-pointer rounded border p-1 flex-shrink-0"
                  value={nuevoHex}
                  onChange={(e) => setNuevoHex(e.target.value)}
                />
                <Input
                  placeholder="#000000"
                  value={nuevoHex}
                  onChange={(e) => setNuevoHex(e.target.value)}
                  className="flex-1 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarHex}
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {codigosHex.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Agregá al menos un código hex. Para tramas, agregá múltiples.
                </p>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/colores")}>
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
