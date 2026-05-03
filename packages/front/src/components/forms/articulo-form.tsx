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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Articulo } from "@/types";
import {
  useCreateArticulosMutation,
  useEditArticulosMutation,
} from "@/hooks/articulos";
import { useGetFamiliasQuery } from "@/hooks/familias";
import { useGetGruposByFamiliaIdQuery } from "@/hooks/grupos";
import { useGetSubgruposByGrupoIdQuery } from "@/hooks/subgrupos";
import { useGetCurvasTalleQuery } from "@/hooks/curvas-talle";
import { useGetCurvasColorQuery } from "@/hooks/curvas-color";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import React from "react";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: "Nombre requerido" }).min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  codigo: z.string({ message: "Código requerido" }).min(1, "Código requerido"),
  sku: z.string({ message: "SKU requerido" }).min(1, "SKU requerido"),
  codigoBarras: z.string().optional(),
  codigoQr: z.string().optional(),
  costo: z.number().min(0, "El costo no puede ser negativo").optional(),
  subgrupoId: z.number({ message: "Subgrupo requerido" }),
  curvaId: z.number({ message: "Curva de talle requerida" }),
  curvaColorId: z.number({ message: "Curva de color requerida" }),
  familiaId: z.number({ message: "Familia requerida" }),
  grupoId: z.number({ message: "Grupo requerido" }),
  tipoContinuidad: z.enum(["continuidad", "temporada"]).optional(),
  esAncla: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ArticuloFormProps {
  defaultValues?: Articulo;
}

const ColorSwatch = ({ hex, size = "sm" }: { hex?: string; size?: "sm" | "md" }) => {
  const dim = size === "md" ? "w-7 h-7" : "w-5 h-5";
  const style = hex
    ? { backgroundColor: hex }
    : { background: "repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)" };
  return <div className={`${dim} rounded-full border shadow-sm flex-shrink-0`} style={style} />;
};

export default function ArticuloForm({ defaultValues }: ArticuloFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const familiaIdInicial =
    defaultValues?.subgrupo?.grupo?.familia?.id ??
    defaultValues?.subgrupo?.grupo?.familiaId;
  const grupoIdInicial = defaultValues?.subgrupo?.grupoId;

  const [familiaSeleccionada, setFamiliaSeleccionada] = React.useState<number | undefined>(familiaIdInicial);
  const [grupoSeleccionado, setGrupoSeleccionado] = React.useState<number | undefined>(grupoIdInicial);

  const { data: familias = [] } = useGetFamiliasQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const { data: grupos = [] } = useGetGruposByFamiliaIdQuery(familiaSeleccionada ?? 0);
  const { data: subgrupos = [] } = useGetSubgruposByGrupoIdQuery(grupoSeleccionado ?? 0);
  const { data: curvas = [] } = useGetCurvasTalleQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const { data: curvasColor = [] } = useGetCurvasColorQuery({ pagination: { pageIndex: 0, pageSize: 100 } });

  const { mutateAsync: create, isPending: isCreating } = useCreateArticulosMutation();
  const { mutateAsync: update, isPending: isUpdating } = useEditArticulosMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id,
      nombre: defaultValues?.nombre || "",
      descripcion: defaultValues?.descripcion || "",
      codigo: defaultValues?.codigo || "",
      sku: defaultValues?.sku || "",
      codigoBarras: defaultValues?.codigoBarras || "",
      codigoQr: defaultValues?.codigoQr || "",
      costo: defaultValues?.costo ?? undefined,
      subgrupoId: defaultValues?.subgrupoId,
      curvaId: defaultValues?.curvaId,
      curvaColorId: defaultValues?.curvaColorId,
      familiaId: familiaIdInicial,
      grupoId: grupoIdInicial,
      tipoContinuidad: defaultValues?.tipoContinuidad,
      esAncla: defaultValues?.esAncla ?? false,
    },
  });

  const curvaSeleccionadaId = form.watch("curvaId");
  const curvaColorSeleccionadaId = form.watch("curvaColorId");

  const curvaSeleccionada = curvas.find((c) => c.id === curvaSeleccionadaId);
  const curvaColorSeleccionada = curvasColor.find((c) => c.id === curvaColorSeleccionadaId);

  const tallesPreview =
    curvaSeleccionada?.talles ??
    curvaSeleccionada?.detalles?.map((d) => d.talle).filter(Boolean) ??
    [];
  const coloresPreview =
    curvaColorSeleccionada?.colores ??
    curvaColorSeleccionada?.detalles?.map((d) => d.color).filter(Boolean) ??
    [];

  const onSubmit = async (values: FormValues) => {
    try {
      const { familiaId: _f, grupoId: _g, ...payload } = values;
      if (isEditing) {
        await update({ id: values.id!, data: payload as Articulo });
      } else {
        await create(payload as Articulo);
      }
      toast({ title: isEditing ? "Artículo actualizado" : "Artículo creado" });
      router.push("/articulos");
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre y descripción */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del artículo" {...field} />
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
                  <Textarea placeholder="Descripción opcional del artículo" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Códigos */}
        <div>
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Identificadores</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input placeholder="Código interno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigoBarras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigoQr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código QR</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Clasificación */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Clasificación</p>
          <div className="grid grid-cols-3 gap-3">
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
                      form.setValue("subgrupoId", undefined as unknown as number);
                    }}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Familia" />
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
                    onValueChange={(v) => {
                      const id = Number(v);
                      field.onChange(id);
                      setGrupoSeleccionado(id);
                      form.setValue("subgrupoId", undefined as unknown as number);
                    }}
                    value={field.value ? String(field.value) : undefined}
                    disabled={!familiaSeleccionada}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={familiaSeleccionada ? "Grupo" : "Primero familia"} />
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
              name="subgrupoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subgrupo *</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={!grupoSeleccionado}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={grupoSeleccionado ? "Subgrupo" : "Primero grupo"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subgrupos.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Curva y Paleta */}
        <div>
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Talles y colores</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="curvaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curva de talle *</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná curva" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {curvas.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
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
              name="curvaColorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curva de color *</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná curva de color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {curvasColor.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Preview de combinaciones mejorado */}
        {(curvaSeleccionadaId || curvaColorSeleccionadaId) && (
          <div className="border rounded-lg bg-muted/10 overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Preview de combinaciones</p>
                <div className="flex items-center gap-2">
                  {tallesPreview.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {tallesPreview.length} talle{tallesPreview.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {coloresPreview.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {coloresPreview.length} color{coloresPreview.length !== 1 ? "es" : ""}
                    </Badge>
                  )}
                  {tallesPreview.length > 0 && coloresPreview.length > 0 && (
                    <Badge className="text-xs">
                      {tallesPreview.length * coloresPreview.length} variantes
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Talles */}
              {tallesPreview.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Talles de la curva</p>
                  <div className="flex flex-wrap items-center gap-1">
                    {tallesPreview.map((t, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="font-mono font-semibold text-sm bg-muted px-2.5 py-1 rounded">
                          {t?.codigo}
                        </span>
                        {i < tallesPreview.length - 1 && (
                          <span className="text-muted-foreground text-xs">›</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colores de la curva de color */}
              {coloresPreview.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Colores de la curva</p>
                  <div className="flex flex-wrap gap-2">
                    {coloresPreview.map((c, i) => {
                      const codigos = c?.codigos ?? [];
                      const hexPrimario = codigos[0]?.hex;
                      return (
                        <div key={i} className="flex items-center gap-1.5 bg-muted rounded-full pl-1.5 pr-2.5 py-1">
                          {codigos.length > 1 ? (
                            <div className="flex -space-x-1">
                              {codigos.slice(0, 3).map((cod, j) => (
                                <ColorSwatch key={j} hex={cod?.hex} size="sm" />
                              ))}
                            </div>
                          ) : (
                            <ColorSwatch hex={hexPrimario} size="sm" />
                          )}
                          <span className="text-xs font-mono font-medium">{c?.nombre}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(tallesPreview.length === 0 || coloresPreview.length === 0) &&
                curvaSeleccionadaId &&
                curvaColorSeleccionadaId && (
                  <p className="text-sm text-muted-foreground">
                    La curva y/o curva de color seleccionadas no tienen talles/colores cargados.
                  </p>
                )}
            </div>
          </div>
        )}

        {/* Clasificación comercial */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Clasificación comercial</p>

          <FormField
            control={form.control}
            name="tipoContinuidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="continuidad" id="continuidad" />
                      <label htmlFor="continuidad" className="text-sm cursor-pointer">Continuidad</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="temporada" id="temporada" />
                      <label htmlFor="temporada" className="text-sm cursor-pointer">Temporada</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="esAncla"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Artículo ancla</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/articulos")}>
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
