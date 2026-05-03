'use client';

import React from 'react';
import { Articulo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { SiluetaSvg, TipoSilueta } from '@/components/stock/siluetas';
import { useGetGrillaQuery } from '@/hooks/articulo-variantes';
import { useGetStockPorArticuloQuery } from '@/hooks/stock-por-ubicacion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CombinacionesArticuloProps {
  articulo: Articulo;
}

const ColorSwatch = ({ hex, size = 'md' }: { hex?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const style = hex
    ? { backgroundColor: hex }
    : { background: 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)' };
  return <div className={`${dim} rounded-full border shadow-sm flex-shrink-0`} style={style} />;
};

export function CombinacionesArticulo({ articulo }: CombinacionesArticuloProps) {
  const talles = articulo.talles ?? [];
  const colores = articulo.colores ?? [];
  const silueta = articulo.subgrupo?.grupo?.familia?.silueta as TipoSilueta | undefined;

  const { data: grilla } = useGetGrillaQuery(articulo.id!);
  const { data: stockPorUbicacion } = useGetStockPorArticuloQuery(articulo.id!);

  const getPrimerHex = (color: typeof colores[0]['color']) => color?.codigos?.[0]?.hex;

  const getCelda = (talleId: number, colorId: number) =>
    grilla?.celdas.find((c) => c.talleId === talleId && c.colorId === colorId);

  const getStock = (talleId: number, colorId: number): number => {
    const celda = getCelda(talleId, colorId);
    return parseInt(celda?.cantidad ?? '0') || 0;
  };

  const getStockPorUbicacion = (varianteId: number) =>
    (stockPorUbicacion ?? []).filter((s) => s.articuloVarianteId === varianteId);

  if (talles.length === 0 && colores.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        El artículo no tiene talles ni colores asignados.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary" className="text-sm font-medium">
          {talles.length} talle{talles.length !== 1 ? 's' : ''}
        </Badge>
        <span className="text-muted-foreground">×</span>
        <Badge variant="secondary" className="text-sm font-medium">
          {colores.length} color{colores.length !== 1 ? 'es' : ''}
        </Badge>
        <span className="text-muted-foreground">=</span>
        <Badge className="text-sm font-medium">
          {talles.length * colores.length} combinación{talles.length * colores.length !== 1 ? 'es' : ''}
        </Badge>
        {grilla?.stockTotal !== undefined && (
          <>
            <span className="text-muted-foreground">·</span>
            <Badge variant="outline" className="text-sm font-semibold tabular-nums">
              {grilla.stockTotal} en stock
            </Badge>
          </>
        )}
      </div>

      {/* Vista por color (siluetas) + Talles en 2 cols */}
      <div className="grid grid-cols-2 gap-6">
        {silueta && colores.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
              Colores
            </p>
            <div className="flex flex-wrap gap-4">
              {colores.map((ac) => {
                const hexes = (ac.color?.codigos ?? []).map((c) => c.hex);
                return (
                  <div key={ac.colorId} className="flex flex-col items-center gap-2 group">
                    <div className="rounded-lg bg-muted/40 border border-border/50 p-3 group-hover:bg-muted/70 transition-colors">
                      <SiluetaSvg tipo={silueta} colores={hexes.length > 0 ? hexes : undefined} size={56} />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium">{ac.color?.codigo ?? ac.colorId}</span>
                      <span className="text-xs text-muted-foreground max-w-16 text-center truncate">
                        {ac.color?.nombre ?? '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {talles.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Talles disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {talles.map((at) => (
                <div
                  key={at.talleId}
                  className="border rounded-md px-3 py-1.5 bg-muted/30 text-center min-w-12"
                >
                  <span className="font-mono font-semibold text-sm">{at.talle?.codigo ?? at.talleId}</span>
                  {at.talle?.nombre && (
                    <p className="text-xs text-muted-foreground">{at.talle.nombre}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matriz talle × color */}
      {talles.length > 0 && colores.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Matriz de combinaciones
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-medium text-left min-w-14 sticky left-0 z-10" />
                  {colores.map((ac) => {
                    const codigos = ac.color?.codigos ?? [];
                    const hexPrimario = getPrimerHex(ac.color);
                    return (
                      <th key={ac.colorId} className="border p-2 bg-muted font-medium text-center min-w-20">
                        <div className="flex flex-col items-center gap-1">
                          {codigos.length > 1 ? (
                            <div className="flex -space-x-1">
                              {codigos.slice(0, 3).map((c, i) => (
                                <ColorSwatch key={i} hex={c?.hex} size="sm" />
                              ))}
                            </div>
                          ) : (
                            <ColorSwatch hex={hexPrimario} size="sm" />
                          )}
                          <span className="text-xs font-mono">{ac.color?.codigo ?? ac.colorId}</span>
                          {ac.color?.nombre && (
                            <span className="text-xs text-muted-foreground">{ac.color.nombre}</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {talles.map((at) => (
                  <tr key={at.talleId}>
                    <td className="border p-2 font-mono font-semibold bg-muted/40 sticky left-0 text-center">
                      {at.talle?.codigo ?? at.talleId}
                    </td>
                    {colores.map((ac) => {
                      const stock = getStock(at.talleId, ac.colorId);
                      const celda = getCelda(at.talleId, ac.colorId);
                      const varianteId = celda?.varianteId;
                      const distribuciones = varianteId ? getStockPorUbicacion(varianteId) : [];
                      const esClickeable = !!varianteId && stock > 0;
                      const stockClass =
                        stock === 0
                          ? 'text-muted-foreground/50'
                          : stock <= 5
                          ? 'text-yellow-600'
                          : 'text-foreground';

                      return (
                        <td key={ac.colorId} className="border p-0 text-center">
                          {esClickeable ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className={`w-full h-full px-3 py-2 tabular-nums text-xs font-semibold cursor-pointer hover:bg-muted/50 transition-colors ${stockClass}`}
                                >
                                  {stock}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-3" align="center">
                                <p className="text-xs font-semibold mb-2">
                                  {at.talle?.codigo ?? at.talleId} / {ac.color?.codigo ?? ac.colorId}
                                </p>
                                {distribuciones.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">Sin detalle por ubicación</p>
                                ) : (
                                  <div className="space-y-1">
                                    {distribuciones.map((s) => (
                                      <div key={s.id} className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">
                                          {s.ubicacion?.nombre ?? `Ubic. ${s.ubicacionId}`}
                                        </span>
                                        <span className="font-mono font-medium">{s.cantidad}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span className={`block px-3 py-2 text-xs font-medium tabular-nums ${stockClass}`}>
                              {stock}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
