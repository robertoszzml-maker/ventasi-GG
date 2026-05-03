"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  MessageCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPlantillasNotificacionQuery } from "@/hooks/plantilla-notificacion";
import {
  useEnviarMutation,
  usePreviewNotificacionQuery,
} from "@/hooks/envio-notificacion";
import { useGetConfigsByModuleQuery } from "@/hooks/config";
import { CONFIGURACIONES } from "@/constants/config";
import { useToast } from "@/hooks/use-toast";
import { ColumnFiltersState } from "@tanstack/react-table";
import type { PreviewItem } from "@/services/envio-notificacion";

const CANAL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

const TIPOS_CONTACTO = {
  email: [
    { value: "email", label: "Email principal" },
    { value: "emailPagoProveedores", label: "Pago de proveedores" },
  ],
  whatsapp: [
    { value: "telefono", label: "Teléfono principal" },
    { value: "telefonoPagoProveedores", label: "Pago de proveedores" },
  ],
} as const;

type Canal = keyof typeof TIPOS_CONTACTO;

const formSchema = z.object({
  plantillaId: z
    .number({ invalid_type_error: "Seleccioná una plantilla" })
    .min(1, { message: "Seleccioná una plantilla" }),
  canal: z.enum(["email", "whatsapp"]),
  tipoContacto: z.string().min(1),
  cuerpoEditado: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  modelo: string;
  columnFilters?: ColumnFiltersState;
  open: boolean;
  onSuccess?: (resultado: { total: number }) => void;
  onCancel?: () => void;
};

export function EnvioNotificacionForm({
  modelo,
  columnFilters = [],
  open,
  onSuccess,
  onCancel,
}: Props) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantillaId: 0,
      canal: "email",
      tipoContacto: "email",
      cuerpoEditado: "",
    },
  });

  const enviarMutation = useEnviarMutation();

  const [resultado, setResultado] = useState<{ total: number } | null>(null);
  const [clientesExpandido, setClientesExpandido] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: configs = [] } = useGetConfigsByModuleQuery("administracion");
  const emailFrom = configs.find((c) => c.clave === CONFIGURACIONES.NOTIFICACIONES_EMAIL_FROM)?.valor || undefined;
  const emailActivo = configs.find((c) => c.clave === CONFIGURACIONES.NOTIFICACIONES_EMAIL_ACTIVO)?.valor === "1";
  const emailTest = configs.find((c) => c.clave === CONFIGURACIONES.NOTIFICACIONES_EMAIL_TEST)?.valor || undefined;

  const { data: plantillas = [], isLoading: isLoadingPlantillas } =
    useGetPlantillasNotificacionQuery({
      pagination: { pageIndex: 0, pageSize: 1000 },
      columnFilters: [],
      sorting: [{ id: "nombre", desc: false }],
      globalFilter: "",
    });

  const canalWatch = form.watch("canal") as Canal;
  const plantillaIdWatch = form.watch("plantillaId");
  const plantillaSeleccionada = plantillas.find(
    (p) => p.id === plantillaIdWatch
  );

  const { data: previewData = [], isLoading: previewLoading } =
    usePreviewNotificacionQuery(modelo, columnFilters, open && !resultado);

  const tipoContactoWatch = form.watch("tipoContacto");
  const tipoSeleccionado = TIPOS_CONTACTO[canalWatch].find(
    (t) => t.value === tipoContactoWatch
  );

  // Al llegar preview, seleccionar todos por defecto
  useEffect(() => {
    if (previewData.length > 0) {
      setSelectedIds(new Set(previewData.map((c) => c.clienteId)));
    }
  }, [previewData]);

  // Al cambiar plantilla, cargar su cuerpo
  useEffect(() => {
    form.setValue("cuerpoEditado", plantillaSeleccionada?.cuerpo ?? "");
  }, [plantillaSeleccionada]);

  // Resetear al cerrar
  useEffect(() => {
    if (!open) {
      form.reset();
      setResultado(null);
      setClientesExpandido(true);
      setSelectedIds(new Set());
    }
  }, [open]);

  const handleCanalChange = (nuevoCanal: Canal) => {
    form.setValue("canal", nuevoCanal);
    form.setValue("tipoContacto", TIPOS_CONTACTO[nuevoCanal][0].value);
  };

  const toggleCliente = (clienteId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(clienteId)) next.delete(clienteId);
      else next.add(clienteId);
      return next;
    });
  };

  const toggleTodos = () => {
    if (selectedIds.size === previewData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(previewData.map((c) => c.clienteId)));
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (selectedIds.size === 0) {
      toast({
        title: "Seleccioná al menos un cliente",
        variant: "destructive",
      });
      return;
    }
    try {
      const clienteIds = Array.from(selectedIds);
      const res = await enviarMutation.mutateAsync({
        plantillaId: values.plantillaId,
        canal: values.canal,
        modelo,
        columnFilters,
        clienteIds,
        tiposContacto: [values.tipoContacto],
        from: emailFrom,
        emailActivo,
        emailTest,
      });
      setResultado({ total: res.total });
      toast({ title: `Envío registrado: ${res.total} cliente(s) notificado(s)` });
      onSuccess?.(res);
    } catch {
      toast({
        title: "Error al registrar la notificación",
        variant: "destructive",
      });
    }
  };

  const CanalIcon = canalWatch === "email" ? Mail : MessageCircle;

  if (resultado) {
    return (
      <>
        <div className="py-8 flex flex-col items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-2xl font-bold">{resultado.total}</p>
          <p className="text-sm text-muted-foreground text-center">
            cliente(s) notificado(s) vía{" "}
            <span className="font-medium text-foreground">
              {canalWatch === "email" ? "Email" : "WhatsApp"}
            </span>
            {" · "}
            <span className="font-medium text-foreground">
              {tipoSeleccionado?.label}
            </span>
          </p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cerrar
          </Button>
        </div>
      </>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 py-1"
      >
        {/* ── Plantilla ── */}
        <FormField
          control={form.control}
          name="plantillaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantilla *</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value ? String(field.value) : ""}
                disabled={isLoadingPlantillas}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingPlantillas
                          ? "Cargando plantillas..."
                          : "Seleccionar plantilla..."
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plantillas.length === 0 && !isLoadingPlantillas && (
                    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                      No hay plantillas creadas
                    </div>
                  )}
                  {plantillas.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Canal + Destinatario ── */}
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CanalIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Envío</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="canal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Canal
                  </FormLabel>
                  <Select
                    onValueChange={(v) => handleCanalChange(v as Canal)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CANAL_OPTIONS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
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
              name="tipoContacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    {canalWatch === "email" ? "Correo destino" : "Teléfono destino"}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col gap-1.5 pt-1"
                    >
                      {TIPOS_CONTACTO[canalWatch].map((tipo) => (
                        <div key={tipo.value} className="flex items-center gap-2">
                          <RadioGroupItem
                            id={`tipo-contacto-${tipo.value}`}
                            value={tipo.value}
                          />
                          <label
                            htmlFor={`tipo-contacto-${tipo.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {tipo.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Clientes ── */}
        <div className="space-y-1.5">
          <button
            type="button"
            className="w-full flex items-center justify-between group"
            onClick={() => setClientesExpandido((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Clientes a notificar</span>
              {!previewLoading && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {selectedIds.size}/{previewData.length}
                </span>
              )}
            </div>
            {clientesExpandido ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {clientesExpandido && (
            <div className="border rounded-lg overflow-hidden">
              {previewLoading && (
                <p className="px-3 py-3 text-sm text-muted-foreground text-center">
                  Cargando clientes...
                </p>
              )}
              {!previewLoading && previewData.length === 0 && (
                <p className="px-3 py-3 text-sm text-muted-foreground text-center">
                  Sin clientes para notificar con los filtros actuales.
                </p>
              )}
              {!previewLoading && previewData.length > 1 && (
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
                  <Checkbox
                    id="toggle-todos"
                    checked={selectedIds.size === previewData.length}
                    onCheckedChange={toggleTodos}
                  />
                  <label
                    htmlFor="toggle-todos"
                    className="text-xs font-medium text-muted-foreground cursor-pointer"
                  >
                    Seleccionar todos
                  </label>
                </div>
              )}
              <div className="divide-y max-h-44 overflow-y-auto">
                {previewData.map((cliente) => {
                  const contacto = tipoSeleccionado
                    ? cliente[tipoSeleccionado.value as keyof PreviewItem]
                    : null;
                  const sinContacto = !contacto;

                  return (
                    <div
                      key={cliente.clienteId}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/20 transition-colors"
                    >
                      <Checkbox
                        id={`cliente-${cliente.clienteId}`}
                        checked={selectedIds.has(cliente.clienteId)}
                        onCheckedChange={() => toggleCliente(cliente.clienteId)}
                      />
                      <label
                        htmlFor={`cliente-${cliente.clienteId}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="text-sm font-medium truncate">
                          {cliente.nombre}
                        </p>
                        <p
                          className={cn(
                            "text-xs truncate",
                            sinContacto
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {sinContacto
                            ? canalWatch === "email"
                              ? "Sin correo"
                              : "Sin teléfono"
                            : String(contacto)}
                        </p>
                      </label>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {cliente.cantidadEntidades} item
                        {cliente.cantidadEntidades !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Mensaje ── */}
        <FormField
          control={form.control}
          name="cuerpoEditado"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Mensaje</FormLabel>
                {plantillaSeleccionada && (
                  <span className="text-xs text-muted-foreground">
                    Editable antes de enviar
                  </span>
                )}
              </div>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccioná una plantilla para previsualizar el mensaje..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            loading={enviarMutation.isPending}
            disabled={selectedIds.size === 0}
          >
            Registrar envío
            {selectedIds.size > 0 && (
              <span className="ml-1 bg-primary-foreground/20 text-primary-foreground rounded px-1.5 py-0.5 text-xs font-mono">
                {selectedIds.size}
              </span>
            )}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
