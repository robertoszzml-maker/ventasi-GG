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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ejemplo } from "@/types";
import {
  useCreateEjemploMutation,
  useEditEjemploMutation,
} from "@/hooks/ejemplos";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { EjemploCategoriaSelector } from "@/components/selectors/ejemplo-categoria-selector";
import { DatePicker } from "@/components/form-helpers/date-picker";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";
import { useFileUploadHandler } from "@/hooks/file-upload";
import React from "react";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  fecha: z.string().optional(),
  estado: z.string().default("activo"),
  imagenId: z.unknown().optional(),
  ejemploCategoriaId: z.number({ message: "Categoría requerida" }),
});

type FormValues = z.infer<typeof formSchema>;

interface EjemploFormProps {
  defaultValues?: Ejemplo;
}

export default function EjemploForm({ defaultValues }: EjemploFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const [files, setFiles] = React.useState<File[]>([]);
  const { handleFileUpload } = useFileUploadHandler();

  const { mutateAsync: create, isPending: isCreating } =
    useCreateEjemploMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useEditEjemploMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      descripcion: defaultValues?.descripcion || "",
      fecha: defaultValues?.fecha || "",
      estado: defaultValues?.estado || "activo",
      imagenId: defaultValues?.imagenId,
      ejemploCategoriaId: defaultValues?.ejemploCategoriaId,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      let savedId: number;
      console.log("hola");

      if (isEditing) {
        await update({ id: values.id!, data: values as Ejemplo });
        savedId = values.id!;
      } else {
        const created = await create(values as Ejemplo);
        savedId = created.id!;
      }

      // Subir / actualizar / eliminar imagen
      const archivo = await handleFileUpload({
        fileId: values.imagenId,
        fileArray: files,
        modelo: "ejemplo",
        modeloId: savedId,
        tipo: "imagen",
      });

      // Si se creó un archivo nuevo, guardar el imagenId
      if (archivo?.id && archivo.id !== values.imagenId) {
        await update({
          id: savedId,
          data: { imagenId: archivo.id } as Ejemplo,
        });
      }

      toast({ title: isEditing ? "Ejemplo actualizado" : "Ejemplo creado" });
      router.push("/ejemplos");
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onError={(e) => {
          console.log("ERRO", e);
        }}
        className="space-y-6"
      >
        {/* Nombre */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del ejemplo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
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

        {/* Categoría */}
        <FormField
          control={form.control}
          name="ejemploCategoriaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría *</FormLabel>
              <FormControl>
                <EjemploCategoriaSelector
                  value={defaultValues?.ejemploCategoria}
                  onChange={(cat) => field.onChange(cat.id)}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha */}
        <DatePicker form={form} name="fecha" label="Fecha" />

        {/* Estado */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Imagen */}
        <ArchivosInput
          label="Imagen"
          value={files}
          setValue={(f) => setFiles(f ?? [])}
          defaultValue={defaultValues?.imagen}
          onDelete={() => form.setValue("imagenId", undefined)}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/ejemplos")}
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
