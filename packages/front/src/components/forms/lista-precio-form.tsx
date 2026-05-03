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
import { ListaPrecio } from "@/types";
import { useCreateListaPrecioMutation, useGetListasPrecioQuery } from "@/hooks/lista-precio";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { hasPermission } from "@/hooks/use-access";
import { PERMISOS } from "@/constants/permisos";

const formSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  modo: z.enum(["CERO", "COPIAR", "PORCENTAJE", "DESDE_COSTO"]).default("CERO"),
  listaOrigenId: z.number().optional(),
  porcentaje: z.number().optional(),
  factor: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListaPrecioForm() {
  const { toast } = useToast();
  const router = useRouter();
  const puedeVerCosto = hasPermission(PERMISOS.ARTICULO_VER_COSTO);

  const { data: listas = [] } = useGetListasPrecioQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const { mutateAsync: create, isPending } = useCreateListaPrecioMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", descripcion: "", modo: "CERO" },
  });

  const modoSeleccionado = form.watch("modo");

  const onSubmit = async (values: FormValues) => {
    try {
      await create(values as ListaPrecio);
      toast({ title: "Lista de precios creada" });
      router.push("/listas-de-precios");
    } catch {
      toast({ title: "Error al crear la lista", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mayorista Julio 2026" {...field} />
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
                <Textarea placeholder="Descripción opcional" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inicializar precios con</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CERO">Todos en cero</SelectItem>
                  <SelectItem value="COPIAR">Copiar de otra lista</SelectItem>
                  <SelectItem value="PORCENTAJE">Aplicar porcentaje sobre lista</SelectItem>
                  {puedeVerCosto && (
                    <SelectItem value="DESDE_COSTO">Calcular desde costo</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(modoSeleccionado === "COPIAR" || modoSeleccionado === "PORCENTAJE") && (
          <FormField
            control={form.control}
            name="listaOrigenId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lista origen *</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar lista" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {listas.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {modoSeleccionado === "PORCENTAJE" && (
          <FormField
            control={form.control}
            name="porcentaje"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porcentaje (puede ser negativo para descuento)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 20 para +20%, -10 para -10%"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {modoSeleccionado === "DESDE_COSTO" && (
          <FormField
            control={form.control}
            name="factor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Factor de multiplicación *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 2.5 → precio = costo × 2.5"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/listas-de-precios")}>
            Cancelar
          </Button>
          <LoadingButton type="submit" loading={isPending}>
            Crear lista
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
