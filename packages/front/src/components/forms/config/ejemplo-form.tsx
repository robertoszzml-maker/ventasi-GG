"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetConfigsByModuleQuery,
  useEditConfigMutation,
} from "@/hooks/config";
import { CONFIGURACIONES } from "@/constants/config";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  [CONFIGURACIONES.EJEMPLO_LIMITE_REGISTROS]: z.string().optional(),
  [CONFIGURACIONES.EJEMPLO_ESTADO_DEFAULT]: z.string().optional(),
  [CONFIGURACIONES.EJEMPLO_PERMITIR_SIN_IMAGEN]: z.boolean(),
});

export default function EjemploConfigForm() {
  const modulo = "ejemplo";
  const { data: configs = [] } = useGetConfigsByModuleQuery(modulo);
  const { mutateAsync: editConfig } = useEditConfigMutation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      [CONFIGURACIONES.EJEMPLO_LIMITE_REGISTROS]: "10",
      [CONFIGURACIONES.EJEMPLO_ESTADO_DEFAULT]: "activo",
      [CONFIGURACIONES.EJEMPLO_PERMITIR_SIN_IMAGEN]: true,
    },
  });

  useEffect(() => {
    if (configs.length === 0) return;
    form.reset({
      [CONFIGURACIONES.EJEMPLO_LIMITE_REGISTROS]:
        configs.find(
          (c) => c.clave === CONFIGURACIONES.EJEMPLO_LIMITE_REGISTROS
        )?.valor || "10",
      [CONFIGURACIONES.EJEMPLO_ESTADO_DEFAULT]:
        configs.find((c) => c.clave === CONFIGURACIONES.EJEMPLO_ESTADO_DEFAULT)
          ?.valor || "activo",
      [CONFIGURACIONES.EJEMPLO_PERMITIR_SIN_IMAGEN]:
        configs.find(
          (c) => c.clave === CONFIGURACIONES.EJEMPLO_PERMITIR_SIN_IMAGEN
        )?.valor === "1",
    });
  }, [configs]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    for (const [clave, valor] of Object.entries(values)) {
      const config = configs.find((c) => c.clave === clave);
      if (config?.id) {
        const valorString =
          typeof valor === "boolean"
            ? valor
              ? "1"
              : "0"
            : valor?.toString() || "";
        await editConfig({
          id: config.id,
          data: { ...config, valor: valorString },
        });
      }
    }
    toast({ description: "Configuración actualizada" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
        <FormField
          control={form.control}
          name={CONFIGURACIONES.EJEMPLO_LIMITE_REGISTROS}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Límite de registros por página</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                Cantidad de registros por página por defecto en la tabla de
                ejemplos.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={CONFIGURACIONES.EJEMPLO_ESTADO_DEFAULT}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado por defecto</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value as string}
              >
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
              <FormDescription>
                Estado asignado por defecto al crear un nuevo ejemplo.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={CONFIGURACIONES.EJEMPLO_PERMITIR_SIN_IMAGEN}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Permitir sin imagen</FormLabel>
                <FormDescription>
                  Habilita crear ejemplos sin imagen adjunta.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Guardar configuración</Button>
      </form>
    </Form>
  );
}
