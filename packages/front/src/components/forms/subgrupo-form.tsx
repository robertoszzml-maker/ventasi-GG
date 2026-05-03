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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subgrupo } from "@/types";
import {
  useCreateSubgruposMutation,
  useEditSubgruposMutation,
} from "@/hooks/subgrupos";
import { useGetFamiliasQuery } from "@/hooks/familias";
import { useGetGruposByFamiliaIdQuery } from "@/hooks/grupos";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import React from "react";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  grupoId: z.number({ message: "Grupo requerido" }),
  familiaId: z.number({ message: "Familia requerida" }),
});

type FormValues = z.infer<typeof formSchema>;

interface SubgrupoFormProps {
  defaultValues?: Subgrupo;
}

export default function SubgrupoForm({ defaultValues }: SubgrupoFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const familiaIdInicial = defaultValues?.grupo?.familia?.id ?? defaultValues?.grupo?.familiaId;
  const [familiaSeleccionada, setFamiliaSeleccionada] = React.useState<number | undefined>(familiaIdInicial);

  const { data: familias = [] } = useGetFamiliasQuery({
    pagination: { pageIndex: 0, pageSize: 100 },
  });

  const { data: grupos = [] } = useGetGruposByFamiliaIdQuery(familiaSeleccionada ?? 0);

  const { mutateAsync: create, isPending: isCreating } =
    useCreateSubgruposMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useEditSubgruposMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      grupoId: defaultValues?.grupoId,
      familiaId: familiaIdInicial,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { familiaId: _familiaId, ...payload } = values;
      if (isEditing) {
        await update({ id: values.id!, data: payload as Subgrupo });
      } else {
        await create(payload as Subgrupo);
      }
      toast({ title: isEditing ? "Subgrupo actualizado" : "Subgrupo creado" });
      router.push("/subgrupos");
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="familiaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Familia *</FormLabel>
              <Select
                onValueChange={(v) => {
                  const id = Number(v);
                  field.onChange(id);
                  setFamiliaSeleccionada(id);
                  form.setValue("grupoId", undefined as unknown as number);
                }}
                defaultValue={field.value ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una familia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {familias.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grupoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo *</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value ? String(field.value) : undefined}
                disabled={!familiaSeleccionada}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={familiaSeleccionada ? "Seleccione un grupo" : "Primero seleccione una familia"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grupos.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Input placeholder="Nombre del subgrupo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/subgrupos")}
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
