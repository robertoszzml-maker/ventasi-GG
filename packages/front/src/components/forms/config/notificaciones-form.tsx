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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  [CONFIGURACIONES.NOTIFICACIONES_EMAIL_FROM]: z.string().optional(),
  [CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO]: z.boolean(),
  [CONFIGURACIONES.NOTIFICACIONES_EMAIL_TEST]: z.string().optional(),
});

export default function NotificacionesForm() {
  const modulo = "administracion";
  const { data: configs = [] } = useGetConfigsByModuleQuery(modulo);
  const { mutateAsync: editConfig } = useEditConfigMutation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      [CONFIGURACIONES.NOTIFICACIONES_EMAIL_FROM]: "",
      [CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO]: false,
      [CONFIGURACIONES.NOTIFICACIONES_EMAIL_TEST]: "",
    },
  });

  useEffect(() => {
    if (configs.length === 0) return;
    form.reset({
      [CONFIGURACIONES.NOTIFICACIONES_EMAIL_FROM]:
        configs.find(
          (c) => c.clave === CONFIGURACIONES.NOTIFICACIONES_EMAIL_FROM
        )?.valor || "",
      [CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO]:
        configs.find(
          (c) => c.clave === CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO
        )?.valor === "1",
      [CONFIGURACIONES.NOTIFICACIONES_EMAIL_TEST]:
        configs.find(
          (c) => c.clave === CONFIGURACIONES.NOTIFICACIONES_EMAIL_TEST
        )?.valor || "",
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

  const emailActivo = form.watch(CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
        <FormField
          control={form.control}
          name={CONFIGURACIONES.NOTIFICACIONES_EMAIL_FROM}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección de envío (From)</FormLabel>
              <FormControl>
                <Input
                  placeholder="ej: administracion@ventasi.com.ar"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Casilla desde la que se enviarán las notificaciones. Debe estar
                configurada como alias en la cuenta SMTP.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO}
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Activar envío de emails</FormLabel>
                <FormDescription>
                  Si está desactivado, los emails se redirigen al correo de
                  prueba.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!emailActivo && (
          <FormField
            control={form.control}
            name={CONFIGURACIONES.NOTIFICACIONES_EMAIL_TEST}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de prueba</FormLabel>
                <FormControl>
                  <Input placeholder="ej: dev@ventasi.com.ar" {...field} />
                </FormControl>
                <FormDescription>
                  Todos los envíos se redirigirán a este correo mientras el
                  envío real esté desactivado.
                </FormDescription>
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Guardar configuración</Button>
      </form>
    </Form>
  );
}
