'use client';

import React from 'react';
import { Cobro } from '@/types';
import { X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ListaCobrosProps {
  cobros: Cobro[];
  sumaMontos: number;
  totalVenta: number;
  onEliminar: (cobro: Cobro) => void;
}

export function ListaCobros({ cobros, sumaMontos, totalVenta, onEliminar }: ListaCobrosProps) {
  const saldo = totalVenta - sumaMontos;
  const cubierto = saldo <= 0.01;

  if (cobros.length === 0) return null;

  return (
    <div className="space-y-1">
      {cobros.map((cobro) => (
        <div
          key={cobro.id}
          className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors"
        >
          <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">
            {cobro.medioPago?.codigo ?? '—'}
          </span>
          <span className="text-sm text-foreground flex-1 truncate">
            {cobro.medioPago?.nombre ?? `Medio #${cobro.medioPagoId}`}
          </span>
          {cobro.cuotas > 1 && (
            <span className="text-xs text-muted-foreground shrink-0">{cobro.cuotas}c</span>
          )}
          <span className="text-sm font-semibold tabular-nums shrink-0">
            ${fmt(parseFloat(cobro.monto))}
          </span>
          <button
            type="button"
            onClick={() => onEliminar(cobro)}
            aria-label={`Eliminar cobro ${cobro.medioPago?.nombre}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <div
        className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2 mt-1 text-sm font-semibold transition-colors',
          cubierto
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200',
        )}
      >
        <div className="flex items-center gap-1.5">
          {cubierto && <CheckCircle2 className="h-4 w-4" />}
          <span>{cubierto ? 'Saldo cubierto' : `Resta cobrar`}</span>
        </div>
        <span className="tabular-nums">
          {cubierto ? `$${fmt(sumaMontos)}` : `$${fmt(Math.abs(saldo))}`}
        </span>
      </div>
    </div>
  );
}
