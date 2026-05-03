"use client";

import { ChevronDown, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DetalleMovimiento, Articulo } from "@/types";
import { useGetTallesQuery } from "@/hooks/talles";
import { useGetColoresQuery } from "@/hooks/colores";
import { useGetStockPorArticuloQuery } from "@/hooks/stock-por-ubicacion";
import { SiluetaSvg, TipoSilueta } from "@/components/stock/siluetas";
import React from "react";

const PAGINACION_BASE = { pagination: { pageIndex: 0, pageSize: 500 } };

interface ArticuloMovimientoRowProps {
  articulo: Articulo;
  detalles: DetalleMovimiento[];
  onEditar: (articulo: Articulo) => void;
  onRemove: (articuloId: number) => void;
  onDetallesChange: (articuloId: number, detalles: DetalleMovimiento[]) => void;
  ubicacionId?: number;
  modoArreglo?: boolean;
}

export function ArticuloMovimientoRow({
  articulo,
  detalles,
  onEditar,
  onRemove,
  onDetallesChange,
  ubicacionId,
  modoArreglo = false,
}: ArticuloMovimientoRowProps) {
  const [expandido, setExpandido] = React.useState(true);

  const { data: todosTalles = [] } = useGetTallesQuery(PAGINACION_BASE);
  const { data: todosColores = [] } = useGetColoresQuery(PAGINACION_BASE);
  const { data: stockUbicacion = [] } = useGetStockPorArticuloQuery(articulo.id!);

  const getTalle = (d: DetalleMovimiento) => {
    if (d.articuloVariante?.talle) return d.articuloVariante.talle;
    if (d.talleId) return (todosTalles as any[]).find((t) => t.id === d.talleId) ?? null;
    return null;
  };

  const getColor = (d: DetalleMovimiento) => {
    if (d.articuloVariante?.color) return d.articuloVariante.color;
    if (d.colorId) return (todosColores as any[]).find((c) => c.id === d.colorId) ?? null;
    return null;
  };

  const stockDeVariante = (d: DetalleMovimiento) => {
    if (!d.articuloVarianteId || d.articuloVarianteId === 0) return null;
    const registros = stockUbicacion.filter((s) => s.articuloVarianteId === d.articuloVarianteId);
    if (ubicacionId) {
      const enUbicacion = registros.find((s) => s.ubicacionId === ubicacionId);
      return enUbicacion ? parseInt(enUbicacion.cantidad) : 0;
    }
    return registros.reduce((sum, s) => sum + parseInt(s.cantidad), 0);
  };

  const cambiarCantidad = (index: number, valor: string) => {
    const nuevos = detalles.map((d, i) =>
      i === index ? { ...d, cantidad: valor } : d
    );
    onDetallesChange(articulo.id!, nuevos);
  };

  const eliminarLinea = (index: number) => {
    const nuevos = detalles.filter((_, i) => i !== index);
    onDetallesChange(articulo.id!, nuevos);
  };

  const detallesVisibles = detalles;
  const total = detalles.reduce((s, d) => s + (parseInt(d.cantidad) || 0), 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer select-none"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-2">
          {expandido ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {articulo.subgrupo?.grupo?.familia?.silueta && (
            <SiluetaSvg
              tipo={articulo.subgrupo.grupo.familia.silueta as TipoSilueta}
              size={18}
              className="opacity-50"
            />
          )}
          <span className="font-medium text-sm">{articulo.nombre}</span>
          {articulo.sku && (
            <span className="text-xs text-muted-foreground">({articulo.sku})</span>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {total > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{total} uds</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEditar(articulo)}
            title="Agregar combinaciones"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:text-destructive"
            onClick={() => onRemove(articulo.id!)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Detalle expandido — editable inline */}
      {expandido && (
        <div className="px-4 py-3">
          {detallesVisibles.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">
              Sin cantidades cargadas.{' '}
              <button
                type="button"
                className="underline text-primary"
                onClick={() => onEditar(articulo)}
              >
                Cargar cantidades
              </button>
            </p>
          ) : (
            <table className="text-xs w-full">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left pb-1 font-medium">Talle</th>
                  <th className="text-left pb-1 font-medium">Color</th>
                  <th className="text-right pb-1 font-medium">Stock</th>
                  {modoArreglo ? (
                    <>
                      <th className="text-right pb-1 font-medium">Anterior</th>
                      <th className="text-right pb-1 font-medium">Nuevo</th>
                    </>
                  ) : (
                    <th className="text-right pb-1 font-medium w-24">Cantidad</th>
                  )}
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {detallesVisibles.map((d, i) => {
                  const stockVariante = stockDeVariante(d);
                  const talle = getTalle(d);
                  const color = getColor(d);
                  const hexCodes: string[] = color?.codigos?.map((c: any) => c.hex) ?? color?.codigosHex ?? [];
                  return (
                  <tr key={i} className="border-t border-border/30 group">
                    <td className="py-1">
                      {talle ? (
                        <span className="font-mono font-medium">{talle.codigo}</span>
                      ) : '—'}
                    </td>
                    <td className="py-1">
                      {color ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1 flex-shrink-0">
                            {hexCodes.length === 0 ? (
                              <div
                                className="w-4 h-4 rounded-full border shadow-sm"
                                style={{ background: 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)' }}
                              />
                            ) : (
                              hexCodes.slice(0, 4).map((hex: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded-full border shadow-sm"
                                  style={{ backgroundColor: hex }}
                                />
                              ))
                            )}
                          </div>
                          <span>{color.codigo}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-1 text-right">
                      {stockVariante === null ? (
                        <span className="text-muted-foreground/50">—</span>
                      ) : (
                        <span className={`tabular-nums ${stockVariante === 0 ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                          {stockVariante}
                        </span>
                      )}
                    </td>
                    {modoArreglo ? (
                      <>
                        <td className="py-1 text-right text-muted-foreground">{d.cantidadAnterior ?? '—'}</td>
                        <td className="py-1 text-right">
                          <Input
                            type="number"
                            min="0"
                            value={d.cantidadNueva ?? d.cantidad}
                            onChange={(e) => cambiarCantidad(i, e.target.value)}
                            className="h-6 w-20 text-xs text-right ml-auto px-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      </>
                    ) : (
                      <td className="py-1 text-right">
                        <Input
                          type="number"
                          min="0"
                          value={d.cantidad}
                          onChange={(e) => cambiarCantidad(i, e.target.value)}
                          className="h-6 w-20 text-xs text-right ml-auto px-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    <td className="py-1 pl-1">
                      <button
                        type="button"
                        onClick={() => eliminarLinea(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
