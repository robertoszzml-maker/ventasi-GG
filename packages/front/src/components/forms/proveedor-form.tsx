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
import { Proveedor } from "@/types";
import { useCreateProveedorMutation, useEditProveedorMutation } from "@/hooks/proveedor";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  cuit: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface ProveedorFormProps {
  data?: Proveedor;
}

export default function ProveedorForm({ data }: ProveedorFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!data?.id;

  const { mutateAsync: create, isPending: isCreating } = useCreateProveedorMutation();
  const { mutateAsync: update, isPending: isUpdating } = useEditProveedorMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      nombre: data?.nombre || "",
      cuit: data?.cuit || "",
      telefono: data?.telefono || "",
      email: data?.email || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as Proveedor });
      } else {
        await create(values as Proveedor);
      }
      toast({ title: isEditing ? "Proveedor actualizado" : "Proveedor creado" });
      router.push("/proveedores");
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
                <Input placeholder="Nombre del proveedor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cuit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CUIT</FormLabel>
              <FormControl>
                <Input placeholder="20-12345678-9" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+54 11 1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="proveedor@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/proveedores")}>
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
