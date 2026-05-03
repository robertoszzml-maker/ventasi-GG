'use client';

import React from 'react';
import { Minus, Plus, X, Percent, ShoppingCart } from 'lucide-react';
import { VentaDetalle } from '@/types';
import { cn } from '@/lib/utils';

function fmt(v: string | number) {
  return parseFloat(String(v || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalcularSubtotal(d: VentaDetalle): string {
  const precio = parseFloat(d.precioUnitario || '0');
  const cant = parseFloat(d.cantidad || '1');
  let sub = precio * cant;
  if (d.descuentoPorcentaje) sub = sub * (1 - parseFloat(d.descuentoPorcentaje) / 100);
  else if (d.descuentoMonto) sub = sub - parseFloat(d.descuentoMonto);
  return Math.max(0, sub).toFixed(2);
}

interface PosCarritoProps {
  detalles: VentaDetalle[];
  total: number;
  onUpdate: (index: number, patch: Partial<VentaDetalle>) => void;
  onRemove: (index: number) => void;
}

function LineaCarrito({
  detalle,
  index,
  onUpdate,
  onRemove,
}: {
  detalle: VentaDetalle;
  index: number;
  onUpdate: (patch: Partial<VentaDetalle>) => void;
  onRemove: () => void;
}) {
  const [descAbierto, setDescAbierto] = React.useState(false);
  const variante = detalle.articuloVariante;
  const articulo = variante?.articulo;
  const cantidadNum = parseInt(detalle.cantidad || '1');
  const tieneDescuento = !!(detalle.descuentoPorcentaje || detalle.descuentoMonto);

  const cambiarCantidad = (delta: number) => {
    const nueva = Math.max(1, cantidadNum + delta);
    const patch: Partial<VentaDetalle> = { cantidad: String(nueva) };
    patch.subtotalLinea = recalcularSubtotal({ ...detalle, ...patch });
    onUpdate(patch);
  };

  return (
    <div className="px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-2">
        {/* Info artículo */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">
            {articulo?.nombre ?? `Variante #${detalle.articuloVarianteId}`}
          </p>
          {(variante?.talle || variante?.color) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {[variante.talle?.codigo, variante.color?.codigo].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>

        {/* Controles de cantidad */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => cambiarCantidad(-1)}
            disabled={cantidadNum <= 1}
            className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-bold tabular-nums">{cantidadNum}</span>
          <button
            type="button"
            onClick={() => cambiarCantidad(1)}
            className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Subtotal */}
        <p className="text-sm font-bold tabular-nums w-20 text-right shrink-0">
          ${fmt(detalle.subtotalLinea || '0')}
        </p>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setDescAbierto((v) => !v)}
            className={cn(
              'h-7 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer',
              tieneDescuento || descAbierto
                ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                : 'border-border hover:bg-muted text-muted-foreground',
            )}
            title="Descuento"
          >
            <Percent className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Descuento expandible */}
      {descAbierto && (
        <div className="mt-2 flex items-center gap-2 pl-2">
          <span className="text-xs text-muted-foreground shrink-0">Desc:</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              className={cn(
                'h-7 w-16 rounded-md border text-center text-xs outline-none focus:ring-1 focus:ring-ring pr-4',
                detalle.descuentoPorcentaje && 'border-red-300 bg-red-50 text-red-700',
              )}
              value={detalle.descuentoPorcentaje ?? ''}
              onChange={(e) => {
                const patch: Partial<VentaDetalle> = {
                  descuentoPorcentaje: e.target.value || undefined,
                  descuentoMonto: undefined,
                };
                patch.subtotalLinea = recalcularSubtotal({ ...detalle, ...patch });
                onUpdate(patch);
              }}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
          </div>
          <span className="text-xs text-muted-foreground">o</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className={cn(
                'h-7 w-20 rounded-md border text-center text-xs outline-none focus:ring-1 focus:ring-ring pl-4',
                detalle.descuentoMonto && 'border-red-300 bg-red-50 text-red-700',
              )}
              value={detalle.descuentoMonto ?? ''}
              onChange={(e) => {
                const patch: Partial<VentaDetalle> = {
                  descuentoMonto: e.target.value || undefined,
                  descuentoPorcentaje: undefined,
                };
                patch.subtotalLinea = recalcularSubtotal({ ...detalle, ...patch });
                onUpdate(patch);
              }}
            />
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
          </div>
          {tieneDescuento && (
            <span className="text-xs text-red-600 font-medium">
              − ${fmt(parseFloat(detalle.subtotalLinea || '0') < parseFloat(detalle.precioUnitario || '0') * cantidadNum
                ? (parseFloat(detalle.precioUnitario || '0') * cantidadNum - parseFloat(detalle.subtotalLinea || '0'))
                : 0)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function PosCarrito({ detalles, total, onUpdate, onRemove }: PosCarritoProps) {
  if (detalles.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <ShoppingCart className="h-8 w-8 opacity-20" />
        <p className="text-sm">Sin artículos en el carrito</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="divide-y">
        {detalles.map((d, i) => (
          <LineaCarrito
            key={i}
            detalle={d}
            index={i}
            onUpdate={(patch) => onUpdate(i, patch)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>

      {/* Total */}
      <div className="border-t bg-muted/10 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Total ({detalles.length} {detalles.length === 1 ? 'ítem' : 'ítems'})
        </span>
        <span className="text-xl font-bold tabular-nums text-primary">${fmt(total)}</span>
      </div>
    </div>
  );
}
