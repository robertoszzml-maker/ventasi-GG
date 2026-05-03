'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { VentaDetalle, Venta } from '@/types';
import { cn } from '@/lib/utils';

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clampZero(v: number) {
  return Math.max(0, v);
}

export function calcularTotales(
  detalles: VentaDetalle[],
  descuentoPct: string,
  descuentoMonto: string,
  recargoPct: string,
  recargoMonto: string,
) {
  const subtotal = detalles.reduce((acc, d) => acc + parseFloat(d.subtotalLinea || '0'), 0);

  const dPct = parseFloat(descuentoPct || '0');
  const dMonto = parseFloat(descuentoMonto || '0');
  const rPct = parseFloat(recargoPct || '0');
  const rMonto = parseFloat(recargoMonto || '0');

  const descGlobal = clampZero(subtotal * dPct / 100 + dMonto);
  const baseAntesRecargo = clampZero(subtotal - descGlobal);
  const recargoGlobal = clampZero(baseAntesRecargo * rPct / 100 + rMonto);
  const baseImponible = baseAntesRecargo + recargoGlobal;
  const iva = baseImponible * 0.21;
  const total = baseImponible + iva;

  return { subtotal, descGlobal, recargoGlobal, baseImponible, iva, total };
}

interface VentaTotalizadorProps {
  detalles: VentaDetalle[];
  venta: Partial<Venta>;
  onChange: (patch: Partial<Venta>) => void;
  readonly?: boolean;
}

function AjusteRow({
  label,
  colorClass,
  pctValue,
  montoValue,
  onChangePct,
  onChangeMonto,
  readonly,
}: {
  label: string;
  colorClass: string;
  pctValue: string;
  montoValue: string;
  onChangePct: (v: string) => void;
  onChangeMonto: (v: string) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-xs font-medium w-20 shrink-0', colorClass)}>{label}</span>
      {readonly ? (
        <div className={cn('ml-auto text-xs font-medium tabular-nums', colorClass)}>
          {pctValue ? `${pctValue}%` : montoValue ? `$${fmt(parseFloat(montoValue))}` : <span className="text-muted-foreground">—</span>}
        </div>
      ) : (
        <div className="ml-auto flex gap-1.5">
          <div className="relative">
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              className={cn('h-7 w-20 text-right text-xs pr-5', pctValue && 'border-current/30')}
              value={pctValue}
              onChange={(e) => { onChangePct(e.target.value); onChangeMonto(''); }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
          </div>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className={cn('h-7 w-24 text-right text-xs pr-5', montoValue && 'border-current/30')}
              value={montoValue}
              onChange={(e) => { onChangeMonto(e.target.value); onChangePct(''); }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function VentaTotalizador({ detalles, venta, onChange, readonly }: VentaTotalizadorProps) {
  const { subtotal, descGlobal, recargoGlobal, baseImponible, iva, total } = calcularTotales(
    detalles,
    venta.descuentoPorcentaje ?? '',
    venta.descuentoMonto ?? '',
    venta.recargoPorcentaje ?? '',
    venta.recargoMonto ?? '',
  );

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Totales</p>
      </div>

      <div className="p-4 space-y-2.5">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Subtotal ({detalles.length} {detalles.length === 1 ? 'ítem' : 'ítems'})</span>
          <span className="text-sm tabular-nums font-medium">${fmt(subtotal)}</span>
        </div>

        <Separator />

        {/* Descuento */}
        <AjusteRow
          label="Descuento"
          colorClass="text-red-600"
          pctValue={venta.descuentoPorcentaje ?? ''}
          montoValue={venta.descuentoMonto ?? ''}
          onChangePct={(v) => onChange({ descuentoPorcentaje: v || undefined })}
          onChangeMonto={(v) => onChange({ descuentoMonto: v || undefined })}
          readonly={readonly}
        />

        {descGlobal > 0 && (
          <div className="flex justify-between text-xs text-red-600 pl-0.5">
            <span>− Descuento aplicado</span>
            <span className="tabular-nums font-medium">− ${fmt(descGlobal)}</span>
          </div>
        )}

        {/* Recargo */}
        <AjusteRow
          label="Recargo"
          colorClass="text-amber-600"
          pctValue={venta.recargoPorcentaje ?? ''}
          montoValue={venta.recargoMonto ?? ''}
          onChangePct={(v) => onChange({ recargoPorcentaje: v || undefined })}
          onChangeMonto={(v) => onChange({ recargoMonto: v || undefined })}
          readonly={readonly}
        />

        {recargoGlobal > 0 && (
          <div className="flex justify-between text-xs text-amber-600 pl-0.5">
            <span>+ Recargo aplicado</span>
            <span className="tabular-nums font-medium">+ ${fmt(recargoGlobal)}</span>
          </div>
        )}

        <Separator />

        {/* Base imponible + IVA */}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Base imponible</span>
          <span className="tabular-nums">${fmt(baseImponible)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">IVA 21%</span>
          <span className="tabular-nums text-blue-600 font-medium">+ ${fmt(iva)}</span>
        </div>

        <Separator />

        {/* TOTAL */}
        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5 -mx-1">
          <span className="text-sm font-bold uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold tabular-nums text-primary">${fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
