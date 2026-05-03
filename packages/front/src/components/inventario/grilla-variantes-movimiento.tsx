"use client";

import { Input } from "@/components/ui/input";
import { GrillaArticulo, DetalleMovimiento } from "@/types";
import { Plus } from "lucide-react";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTallesQuery } from "@/hooks/talles";
import { useGetColoresQuery } from "@/hooks/colores";

interface GrillaVariantesMovimientoProps {
  articuloId: number;
  grilla: GrillaArticulo;
  detalles: DetalleMovimiento[];
  onChange: (detalles: DetalleMovimiento[]) => void;
  modoArreglo?: boolean;
  stockActual?: Record<number, string>;
}

export function GrillaVariantesMovimiento({
  articuloId,
  grilla,
  detalles,
  onChange,
  modoArreglo = false,
  stockActual = {},
}: GrillaVariantesMovimientoProps) {
  const tallesBaseIds = grilla.talles.map((t) => t.id!);
  const coloresBaseIds = grilla.colores.map((c) => c.id!);

  // Inicializar desde detalles existentes (para cuando se edita un artículo ya cargado)
  const [tallesAgregados, setTallesAgregados] = React.useState<number[]>(() =>
    Array.from(new Set(
      detalles
        .filter((d) => d.articuloVarianteId === 0 && d.talleId != null)
        .map((d) => d.talleId!)
        .filter((id) => !tallesBaseIds.includes(id))
    ))
  );
  const [coloresAgregados, setColoresAgregados] = React.useState<number[]>(() =>
    Array.from(new Set(
      detalles
        .filter((d) => d.articuloVarianteId === 0 && d.colorId != null)
        .map((d) => d.colorId!)
        .filter((id) => !coloresBaseIds.includes(id))
    ))
  );

  // Control de popovers
  const [popoverColorOpen, setPopoverColorOpen] = React.useState(false);
  const [popoverTalleOpen, setPopoverTalleOpen] = React.useState(false);

  // Foco: tras agregar una fila/columna, enfocar el primer input de esa fila/columna
  const tablaRef = React.useRef<HTMLDivElement>(null);
  const [enfocarCelda, setEnfocarCelda] = React.useState<{ tipo: 'talle' | 'color'; id: number } | null>(null);

  React.useEffect(() => {
    if (!enfocarCelda || !tablaRef.current) return;
    const attr = enfocarCelda.tipo === 'talle' ? 'data-talle-id' : 'data-color-id';
    const input = tablaRef.current.querySelector<HTMLInputElement>(
      `input[${attr}="${enfocarCelda.id}"]:not([disabled])`
    );
    input?.focus();
    setEnfocarCelda(null);
  }, [enfocarCelda]);

  const paginacionBase = { pagination: { pageIndex: 0, pageSize: 500 } };
  const { data: todosTalles = [] } = useGetTallesQuery(paginacionBase);
  const { data: todosColores = [] } = useGetColoresQuery(paginacionBase);

  const todosLostallesIds = Array.from(new Set([...tallesBaseIds, ...tallesAgregados]));
  const todosLosColoresIds = Array.from(new Set([...coloresBaseIds, ...coloresAgregados]));

  const tallesActivos = todosLostallesIds.map((id) => {
    const base = grilla.talles.find((t) => t.id === id);
    if (base) return { id: base.id!, codigo: base.codigo, nombre: base.nombre ?? base.codigo, esNuevo: false };
    const extra = (todosTalles as any[]).find((t) => t.id === id);
    return extra ? { id: extra.id, codigo: extra.codigo, nombre: extra.nombre ?? extra.codigo, esNuevo: true } : null;
  }).filter(Boolean) as Array<{ id: number; codigo: string; nombre: string; esNuevo: boolean }>;

  const coloresActivos = todosLosColoresIds.map((id) => {
    const base = grilla.colores.find((c) => c.id === id);
    if (base) return { id: base.id!, codigo: base.codigo, nombre: base.nombre, codigos: base.codigos, esNuevo: false };
    const extra = (todosColores as any[]).find((c) => c.id === id);
    return extra ? { id: extra.id, codigo: extra.codigo, nombre: extra.nombre ?? extra.codigo, codigos: extra.codigosHex ?? [], esNuevo: true } : null;
  }).filter(Boolean) as Array<{ id: number; codigo: string; nombre: string; codigos: string[]; esNuevo: boolean }>;

  const tallesDisponibles = (todosTalles as any[]).filter((t) => !todosLostallesIds.includes(t.id));
  const coloresDisponibles = (todosColores as any[]).filter((c) => !todosLosColoresIds.includes(c.id));

  // — Lectura/escritura —

  const getCantidad = (talleId: number, colorId: number): string => {
    const celda = grilla.celdas.find((c) => c.talleId === talleId && c.colorId === colorId);
    if (celda?.varianteId) {
      return detalles.find((d) => d.articuloVarianteId === celda.varianteId)?.cantidad || "";
    }
    return detalles.find(
      (d) => d.articuloVarianteId === 0 && d.talleId === talleId && d.colorId === colorId
    )?.cantidad || "";
  };

  const getCantidadNueva = (talleId: number, colorId: number): string => {
    const celda = grilla.celdas.find((c) => c.talleId === talleId && c.colorId === colorId);
    if (!celda?.varianteId) return "";
    return detalles.find((d) => d.articuloVarianteId === celda.varianteId)?.cantidadNueva || "";
  };

  const setCantidad = (talleId: number, colorId: number, varianteId: number | undefined, value: string) => {
    const nuevos = [...detalles];
    if (varianteId) {
      const idx = nuevos.findIndex((d) => d.articuloVarianteId === varianteId);
      if (idx >= 0) {
        if (value === "") nuevos.splice(idx, 1);
        else nuevos[idx] = { ...nuevos[idx], cantidad: value };
      } else if (value !== "") {
        nuevos.push({ articuloVarianteId: varianteId, articuloId, talleId, colorId, cantidad: value });
      }
    } else {
      const idx = nuevos.findIndex(
        (d) => d.articuloVarianteId === 0 && d.talleId === talleId && d.colorId === colorId
      );
      if (idx >= 0) {
        if (value === "") nuevos.splice(idx, 1);
        else nuevos[idx] = { ...nuevos[idx], cantidad: value };
      } else if (value !== "") {
        nuevos.push({ articuloVarianteId: 0, articuloId, talleId, colorId, cantidad: value });
      }
    }
    onChange(nuevos);
  };

  const setCantidadNueva = (talleId: number, colorId: number, varianteId: number, value: string) => {
    const nuevos = [...detalles];
    const idx = nuevos.findIndex((d) => d.articuloVarianteId === varianteId);
    const stockPrev = stockActual[varianteId] || "0";
    if (idx >= 0) {
      nuevos[idx] = { ...nuevos[idx], cantidadNueva: value, cantidadAnterior: stockPrev, cantidad: value };
    } else {
      nuevos.push({ articuloVarianteId: varianteId, articuloId, talleId, colorId, cantidad: value, cantidadNueva: value, cantidadAnterior: stockPrev });
    }
    onChange(nuevos);
  };

  const agregarColor = (colorId: string) => {
    const id = parseInt(colorId);
    if (!id || coloresAgregados.includes(id)) return;
    setColoresAgregados((prev) => [...prev, id]);
    setPopoverColorOpen(false);
    setEnfocarCelda({ tipo: 'color', id });
  };

  const agregarTalle = (talleId: string) => {
    const id = parseInt(talleId);
    if (!id || tallesAgregados.includes(id)) return;
    setTallesAgregados((prev) => [...prev, id]);
    setPopoverTalleOpen(false);
    setEnfocarCelda({ tipo: 'talle', id });
  };

  const esCeldaEditable = (talleId: number, colorId: number) => {
    const enCurva = grilla.celdas.some((c) => c.talleId === talleId && c.colorId === colorId);
    const talleAgregado = tallesAgregados.includes(talleId) || tallesBaseIds.includes(talleId);
    const colorAgregado = coloresAgregados.includes(colorId) || coloresBaseIds.includes(colorId);
    return enCurva || (talleAgregado && colorAgregado);
  };

  const subtotal = detalles.reduce((sum, d) => sum + (parseInt(d.cantidad) || 0), 0);

  const btnClass =
    "h-6 w-6 rounded border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center disabled:opacity-30";

  return (
    <div className="overflow-x-auto" ref={tablaRef}>
      <table className="text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            {/* esquina vacía */}
            <th className="w-20" />

            {coloresActivos.map((color) => (
              <th key={color.id} className="text-center px-1 py-1.5 font-medium min-w-[72px]">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ background: color.codigos?.[0] ? `#${color.codigos[0].replace('#', '')}` : '#ccc' }}
                  />
                  <span className={`text-[11px] leading-none ${color.esNuevo ? 'text-primary font-semibold' : ''}`}>
                    {color.nombre || color.codigo}
                  </span>
                </div>
              </th>
            ))}

            {/* + columna (agregar color) */}
            <th className="px-2 w-10 align-middle">
              <Popover open={popoverColorOpen} onOpenChange={setPopoverColorOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className={btnClass} disabled={coloresDisponibles.length === 0}>
                    <Plus className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-2" align="start">
                  <p className="text-xs text-muted-foreground mb-1.5">Agregar color</p>
                  <Select onValueChange={agregarColor}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {coloresDisponibles.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nombre || c.codigo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PopoverContent>
              </Popover>
            </th>
          </tr>
        </thead>

        <tbody>
          {tallesActivos.map((talle) => (
            <tr key={talle.id} className="border-t border-border/40">
              <td className={`px-2 py-1 text-xs font-medium ${talle.esNuevo ? 'text-primary' : 'text-muted-foreground'}`}>
                {talle.nombre || talle.codigo}
              </td>

              {coloresActivos.map((color) => {
                const celda = grilla.celdas.find((c) => c.talleId === talle.id && c.colorId === color.id);
                const editable = esCeldaEditable(talle.id, color.id);

                return (
                  <td key={color.id} className="px-1 py-1 text-center">
                    {modoArreglo ? (
                      <Input
                        type="number"
                        min="0"
                        className="w-16 h-8 text-center mx-auto text-xs"
                        data-talle-id={talle.id}
                        data-color-id={color.id}
                        placeholder={celda?.varianteId ? (stockActual[celda.varianteId] || "0") : "—"}
                        value={celda?.varianteId ? getCantidadNueva(talle.id, color.id) : ""}
                        onChange={(e) => {
                          if (celda?.varianteId) setCantidadNueva(talle.id, color.id, celda.varianteId, e.target.value);
                        }}
                        disabled={!celda?.varianteId}
                      />
                    ) : editable ? (
                      <Input
                        type="number"
                        min="0"
                        className={`w-16 h-8 text-center mx-auto text-xs ${talle.esNuevo || color.esNuevo ? 'border-primary/40' : ''}`}
                        data-talle-id={talle.id}
                        data-color-id={color.id}
                        placeholder="0"
                        value={getCantidad(talle.id, color.id)}
                        onChange={(e) => setCantidad(talle.id, color.id, celda?.varianteId, e.target.value)}
                      />
                    ) : (
                      <span className="text-muted-foreground/25 text-xs select-none">—</span>
                    )}
                  </td>
                );
              })}

              <td />
            </tr>
          ))}

          {/* + fila (agregar talle) */}
          <tr className="border-t border-border/40">
            <td className="px-2 py-1.5">
              <Popover open={popoverTalleOpen} onOpenChange={setPopoverTalleOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className={btnClass} disabled={tallesDisponibles.length === 0}>
                    <Plus className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-2" align="start">
                  <p className="text-xs text-muted-foreground mb-1.5">Agregar talle</p>
                  <Select onValueChange={agregarTalle}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tallesDisponibles.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.nombre || t.codigo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PopoverContent>
              </Popover>
            </td>
            <td colSpan={coloresActivos.length + 1} />
          </tr>
        </tbody>
      </table>

      <div className="mt-2 flex justify-end">
        <span className="text-xs text-muted-foreground">
          Subtotal: <strong>{subtotal}</strong> uds
        </span>
      </div>
    </div>
  );
}
