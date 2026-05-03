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
import { Talle } from "@/types";
import {
  useCreateTallesMutation,
  useEditTallesMutation,
} from "@/hooks/talles";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  id: z.number().optional(),
  codigo: z.string({ message: "Código requerido" }).min(1, "Código requerido"),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  orden: z.coerce.number({ message: "Orden requerido" }).int().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface TalleFormProps {
  defaultValues?: Talle;
}

export default function TalleForm({ defaultValues }: TalleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const { mutateAsync: create, isPending: isCreating } =
    useCreateTallesMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useEditTallesMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      codigo: defaultValues?.codigo || "",
      nombre: defaultValues?.nombre || "",
      orden: defaultValues?.orden ?? 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as Talle });
      } else {
        await create(values as Talle);
      }
      toast({ title: isEditing ? "Talle actualizado" : "Talle creado" });
      router.push("/talles");
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
                  <Input placeholder="Ej: S, M, L, XL" {...field} />
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
                  <Input placeholder="Nombre del talle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/talles")}
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
