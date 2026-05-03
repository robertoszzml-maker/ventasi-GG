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
import { Grupo } from "@/types";
import {
  useCreateGruposMutation,
  useEditGruposMutation,
} from "@/hooks/grupos";
import { useGetFamiliasQuery } from "@/hooks/familias";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  familiaId: z.number({ message: "Familia requerida" }),
});

type FormValues = z.infer<typeof formSchema>;

interface GrupoFormProps {
  defaultValues?: Grupo;
}

export default function GrupoForm({ defaultValues }: GrupoFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const { data: familias = [] } = useGetFamiliasQuery({
    pagination: { pageIndex: 0, pageSize: 100 },
  });

  const { mutateAsync: create, isPending: isCreating } =
    useCreateGruposMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useEditGruposMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      familiaId: defaultValues?.familiaId,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as Grupo });
      } else {
        await create(values as Grupo);
      }
      toast({ title: isEditing ? "Grupo actualizado" : "Grupo creado" });
      router.push("/grupos");
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
                onValueChange={(v) => field.onChange(Number(v))}
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del grupo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/grupos")}
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
