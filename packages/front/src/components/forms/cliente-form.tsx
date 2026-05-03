"use client";

import React from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Cliente } from "@/types";
import { useCreateClienteMutation, useEditClienteMutation } from "@/hooks/cliente";
import { fetchPadron } from "@/services/cliente";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

const CONDICION_IVA_OPTIONS = [
  { value: 'CF', label: 'Consumidor Final' },
  { value: 'RI', label: 'Responsable Inscripto' },
  { value: 'MT', label: 'Monotributista' },
  { value: 'EX', label: 'Exento' },
  { value: 'NC', label: 'No Categorizado' },
];

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  cuit: z.string().optional(),
  condicionIva: z.string().optional(),
  domicilio: z.string().optional(),
  localidad: z.string().optional(),
  provincia: z.string().optional(),
  codigoPostal: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClienteFormProps {
  data?: Cliente;
}

function parsePadronResponse(raw: any): Partial<FormValues> {
  const persona = raw?.persona ?? raw?.getPersonaReturn?.persona ?? raw;
  if (!persona) return {};

  const result: Partial<FormValues> = {};

  if (persona.nombre || persona.razonSocial) {
    result.nombre = persona.razonSocial ?? `${persona.apellido ?? ''} ${persona.nombre ?? ''}`.trim();
  }

  const catIva = persona.categoriaMonotributo ?? persona.actividades?.[0]?.idActividad;
  if (persona.tipoPersona === 'JURIDICA' || catIva == null) {
    result.condicionIva = 'RI';
  } else if (String(catIva).startsWith('9')) {
    result.condicionIva = 'MT';
  } else {
    result.condicionIva = 'CF';
  }

  const domicilio = persona.domicilioFiscal ?? persona.domicilios?.[0];
  if (domicilio) {
    const calle = domicilio.direccion ?? domicilio.calle ?? '';
    const numero = domicilio.numero ?? '';
    result.domicilio = `${calle} ${numero}`.trim();
    result.localidad = domicilio.localidad ?? domicilio.descripcionLocalidad ?? '';
    result.provincia = domicilio.descripcionProvincia ?? '';
    result.codigoPostal = String(domicilio.codPostal ?? domicilio.codigoPostal ?? '');
  }

  return result;
}

export default function ClienteForm({ data }: ClienteFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!data?.id;
  const [buscandoPadron, setBuscandoPadron] = React.useState(false);

  const { mutateAsync: create, isPending: isCreating } = useCreateClienteMutation();
  const { mutateAsync: update, isPending: isUpdating } = useEditClienteMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      nombre: data?.nombre || "",
      email: data?.email || "",
      telefono: data?.telefono || "",
      cuit: data?.cuit || "",
      condicionIva: data?.condicionIva || "",
      domicilio: data?.domicilio || "",
      localidad: data?.localidad || "",
      provincia: data?.provincia || "",
      codigoPostal: data?.codigoPostal || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ id: values.id!, data: values as Cliente });
      } else {
        await create(values as Cliente);
      }
      toast({ title: isEditing ? "Cliente actualizado" : "Cliente creado" });
      router.push("/clientes");
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
                <Input placeholder="Nombre del cliente" {...field} />
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
                <Input placeholder="cliente@ejemplo.com" {...field} />
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

        <Separator />
        <p className="text-sm font-medium text-muted-foreground">Datos fiscales</p>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cuit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  CUIT
                  {buscandoPadron && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="20123456789"
                    {...field}
                    onChange={async (e) => {
                      const cuit = e.target.value.replace(/[-\s]/g, '');
                      field.onChange(e);
                      if (cuit.length === 11) {
                        setBuscandoPadron(true);
                        try {
                          const padron = await fetchPadron(cuit);
                          const mapped = parsePadronResponse(padron);
                          Object.entries(mapped).forEach(([k, v]) => {
                            if (v) form.setValue(k as keyof FormValues, v as string, { shouldDirty: true });
                          });
                          toast({ title: 'Datos del padrón cargados' });
                        } catch {
                          // silencioso — el usuario puede cargar los datos manualmente
                        } finally {
                          setBuscandoPadron(false);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="condicionIva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condición IVA</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONDICION_IVA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="domicilio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domicilio</FormLabel>
              <FormControl>
                <Input placeholder="Calle y número" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="localidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localidad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Córdoba" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Córdoba" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codigoPostal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cód. Postal</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>
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
