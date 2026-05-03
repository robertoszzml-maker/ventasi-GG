'use client';

import React from 'react';
import { MedioPago, TipoCobro } from '@/types';
import { cn } from '@/lib/utils';

const GRUPOS: { label: string; tipos: TipoCobro[] }[] = [
  { label: 'Efectivo / Digital', tipos: ['EFECTIVO', 'QR', 'TRANSFERENCIA', 'APP_DELIVERY'] },
  { label: 'Tarjeta', tipos: ['CREDITO', 'DEBITO'] },
];

interface GrillaMediosPagoProps {
  medios: MedioPago[];
  onSeleccionar: (medio: MedioPago) => void;
  medioCodigo?: string;
}

export function GrillaMediosPago({ medios, onSeleccionar, medioCodigo }: GrillaMediosPagoProps) {
  const grupos = GRUPOS.map((g) => ({
    label: g.label,
    items: medios.filter((m) => g.tipos.includes(m.tipo)),
  })).filter((g) => g.items.length > 0);

  const sinGrupo = medios.filter(
    (m) => !GRUPOS.flatMap((g) => g.tipos).includes(m.tipo),
  );

  const renderMedio = (m: MedioPago) => (
    <button
      key={m.id}
      type="button"
      onClick={() => onSeleccionar(m)}
      className={cn(
        'flex flex-col items-center justify-center px-3 py-2 rounded-lg border text-left',
        'transition-all duration-150 cursor-pointer min-w-[64px]',
        medioCodigo === m.codigo
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-muted/30 hover:bg-muted border-border hover:border-primary/50',
      )}
    >
      <span className="font-mono font-bold text-sm leading-none">{m.codigo}</span>
      <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[60px]">
        {m.cuotas > 1 ? `${m.cuotas}c` : m.tipo.toLowerCase()}
      </span>
    </button>
  );

  return (
    <div className="space-y-3">
      {grupos.map((g) => (
        <div key={g.label}>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            {g.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map(renderMedio)}
          </div>
        </div>
      ))}
      {sinGrupo.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sinGrupo.map(renderMedio)}
        </div>
      )}
    </div>
  );
}
