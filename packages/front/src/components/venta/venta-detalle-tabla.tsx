'use client';

import React from 'react';
import { VentaDetalle } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

function recalcularSubtotal(d: VentaDetalle): string {
  const precio = parseFloat(d.precioUnitario || '0');
  const cant = parseFloat(d.cantidad || '1');
  let sub = precio * cant;
  if (d.descuentoPorcentaje) sub = sub * (1 - parseFloat(d.descuentoPorcentaje) / 100);
  else if (d.descuentoMonto) sub = sub - parseFloat(d.descuentoMonto);
  return sub.toFixed(2);
}

function fmt(v: string | number) {
  return parseFloat(String(v || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

interface VentaDetalleTablaProps {
  detalles: VentaDetalle[];
  onUpdate: (index: number, patch: Partial<VentaDetalle>) => void;
  onRemove: (index: number) => void;
  readonly?: boolean;
}

export function VentaDetalleTabla({ detalles, onUpdate, onRemove, readonly }: VentaDetalleTablaProps) {
  if (detalles.length === 0) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-4 w-4 opacity-50" />
          </div>
          <p className="text-sm font-medium">Sin artículos cargados</p>
          {!readonly && (
            <p className="text-xs text-muted-foreground/70">
              Usá el botón "Agregar artículo" para comenzar
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Artículo</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Talle</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Cant.</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Precio</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Desc %</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Desc $</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Subtotal</th>
              {!readonly && <th className="px-3 py-2.5 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y">
            {detalles.map((d, i) => {
              const variante = d.articuloVariante;
              const articulo = variante?.articulo;
              const tieneDescuento = !!(d.descuentoPorcentaje || d.descuentoMonto);
              return (
                <tr
                  key={i}
                  className={cn(
                    'group hover:bg-muted/30 transition-colors duration-100',
                    !d.articuloVariante && 'opacity-60',
                  )}
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium leading-none text-sm">
                      {articulo?.nombre ?? `Variante #${d.articuloVarianteId}`}
                    </p>
                    {articulo?.sku && (
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{articulo.sku}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {variante?.talle?.codigo ?? '—'}
                      {variante?.color && <span className="ml-1 opacity-70">{variante.color.codigo}</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {readonly ? (
                      <span className="block text-center font-medium">{d.cantidad}</span>
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        className="h-7 w-16 text-center text-sm mx-auto"
                        value={d.cantidad}
                        onChange={(e) => {
                          const patch: Partial<VentaDetalle> = { cantidad: e.target.value };
                          patch.subtotalLinea = recalcularSubtotal({ ...d, ...patch });
                          onUpdate(i, patch);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {readonly ? (
                      <span className="font-medium">${fmt(d.precioUnitario)}</span>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-7 w-24 text-right text-sm ml-auto"
                        value={d.precioUnitario}
                        onChange={(e) => {
                          const patch: Partial<VentaDetalle> = { precioUnitario: e.target.value };
                          patch.subtotalLinea = recalcularSubtotal({ ...d, ...patch });
                          onUpdate(i, patch);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {readonly ? (
                      <span className={cn('block text-center text-xs', tieneDescuento && d.descuentoPorcentaje ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                        {d.descuentoPorcentaje ? `${d.descuentoPorcentaje}%` : '—'}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        className={cn('h-7 w-20 text-center text-sm mx-auto', d.descuentoPorcentaje && 'border-red-300 bg-red-50 text-red-700')}
                        value={d.descuentoPorcentaje ?? ''}
                        onChange={(e) => {
                          const patch: Partial<VentaDetalle> = {
                            descuentoPorcentaje: e.target.value || undefined,
                            descuentoMonto: undefined,
                          };
                          patch.subtotalLinea = recalcularSubtotal({ ...d, ...patch });
                          onUpdate(i, patch);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {readonly ? (
                      <span className={cn('block text-center text-xs', tieneDescuento && d.descuentoMonto ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                        {d.descuentoMonto ? `$${fmt(d.descuentoMonto)}` : '—'}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className={cn('h-7 w-20 text-center text-sm mx-auto', d.descuentoMonto && 'border-red-300 bg-red-50 text-red-700')}
                        value={d.descuentoMonto ?? ''}
                        onChange={(e) => {
                          const patch: Partial<VentaDetalle> = {
                            descuentoMonto: e.target.value || undefined,
                            descuentoPorcentaje: undefined,
                          };
                          patch.subtotalLinea = recalcularSubtotal({ ...d, ...patch });
                          onUpdate(i, patch);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    ${fmt(d.subtotalLinea || '0')}
                  </td>
                  {!readonly && (
                    <td className="px-3 py-2.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                        onClick={() => onRemove(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
