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
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import {
  useCreatePlantillaNotificacionMutation,
  useEditPlantillaNotificacionMutation,
} from "@/hooks/plantilla-notificacion";
import type { PlantillaNotificacion } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import { TODAS_LAS_VARIABLES } from "@/constants/plantilla-notificacion";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/ui/rich-text-editor";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, { message: "Nombre requerido" }),
  descripcion: z.string().optional(),
  asunto: z.string().optional(),
  cuerpo: z.string().min(1, { message: "El cuerpo del mensaje es requerido" }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  data?: PlantillaNotificacion;
  onSuccess?: () => void;
  setOpen?: Dispatch<SetStateAction<boolean>>;
};

export function PlantillaNotificacionForm({
  data,
  onSuccess,
  setOpen,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const createMutation = useCreatePlantillaNotificacionMutation();
  const editMutation = useEditPlantillaNotificacionMutation();
  const editorRef = useRef<RichTextEditorHandle>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      nombre: data?.nombre ?? "",
      descripcion: data?.descripcion ?? "",
      asunto: data?.asunto ?? "",
      cuerpo: data?.cuerpo ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (values.id) {
        await editMutation.mutateAsync({
          id: values.id,
          data: values as PlantillaNotificacion,
        });
      } else {
        await createMutation.mutateAsync(values as PlantillaNotificacion);
      }
      toast({ title: "Plantilla guardada correctamente" });
      onSuccess?.();
      if (setOpen) {
        setOpen(false);
      } else {
        router.push("/administracion/plantillas");
      }
    } catch {
      toast({ title: "Error al guardar la plantilla", variant: "destructive" });
    }
  };

  const insertarVariable = (variable: string) => {
    editorRef.current?.insertContent(variable);
  };

  const isLoading = createMutation.isPending || editMutation.isPending;

  return (
    <div className="flex gap-6">
      {/* Formulario principal */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-4"
        >
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Recordatorio de pago" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input
                    placeholder="Descripción interna (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asunto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Recordatorio de factura pendiente (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuerpo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    ref={editorRef}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2">
            <LoadingButton type="submit" loading={isLoading}>
              {data?.id ? "Guardar cambios" : "Crear plantilla"}
            </LoadingButton>
          </div>
        </form>
      </Form>

      {/* Panel de variables disponibles */}
      <div className="w-60 shrink-0 space-y-3">
        <p className="text-sm font-medium">Variables disponibles</p>
        <p className="text-xs text-muted-foreground">
          Clic para insertar en el mensaje.
        </p>
        <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
          {TODAS_LAS_VARIABLES.map(({ variable, descripcion }) => (
            <button
              key={variable}
              type="button"
              onClick={() => insertarVariable(variable)}
              className="w-full text-left rounded border px-2 py-1.5 text-xs hover:bg-accent transition-colors"
              title={descripcion}
            >
              <span className="font-mono text-blue-600">{variable}</span>
              <span className="text-muted-foreground block truncate">
                {descripcion}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
