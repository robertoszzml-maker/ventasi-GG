'use client';

import React from 'react';
import { useGetDashboardAnclasQuery } from '@/hooks/articulos';
import { ArticuloAncla, EstadoSemaforo, VarianteAncla } from '@/types';
import { PageTitle } from '@/components/ui/page-title';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/skeletons/skeleton-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ESTADO_CONFIG: Record<EstadoSemaforo, { label: string; dot: string; badge: string }> = {
  ROJO:       { label: 'Crítico',   dot: 'bg-red-500',              badge: 'bg-red-100 text-red-700 border-red-200' },
  AMARILLO:   { label: 'Atención',  dot: 'bg-yellow-400',           badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  VERDE:      { label: 'Normal',    dot: 'bg-green-500',            badge: 'bg-green-100 text-green-700 border-green-200' },
  SIN_ESTADO: { label: 'Sin datos', dot: 'bg-muted-foreground/30',  badge: 'bg-muted text-muted-foreground border-muted' },
};

function SemaforoBadge({ estado }: { estado: EstadoSemaforo }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border', cfg.badge)}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function FilaVariante({ v }: { v: VarianteAncla }) {
  const cfg = ESTADO_CONFIG[v.estadoSemaforo];
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="pl-10 pr-3 py-1.5 text-xs font-mono font-semibold">{v.talleCodigo}</td>
      <td className="px-3 py-1.5 text-xs text-muted-foreground">{v.colorNombre}</td>
      <td className="px-3 py-1.5 text-center tabular-nums text-xs font-semibold">{v.stockActual}</td>
      <td className="px-3 py-1.5 text-center text-xs tabular-nums text-red-600">{v.stockMinimo ?? '—'}</td>
      <td className="px-3 py-1.5 text-center text-xs tabular-nums text-yellow-600">{v.stockSeguridad ?? '—'}</td>
      <td className="px-3 py-1.5 text-center text-xs tabular-nums text-green-600">{v.stockMaximo ?? '—'}</td>
      <td className="px-3 py-1.5 text-center">
        <Tooltip>
          <TooltipTrigger>
            <div className={cn('w-3 h-3 rounded-full mx-auto', cfg.dot)} />
          </TooltipTrigger>
          <TooltipContent>{cfg.label}</TooltipContent>
        </Tooltip>
      </td>
    </tr>
  );
}

function FilaArticulo({ articulo }: { articulo: ArticuloAncla }) {
  const [expandido, setExpandido] = React.useState(false);
  const Icon = expandido ? ChevronDown : ChevronRight;

  return (
    <>
      <tr
        className="hover:bg-muted/30 cursor-pointer transition-colors border-t"
        onClick={() => setExpandido((v) => !v)}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-sm">{articulo.nombre}</span>
            <span className="text-xs text-muted-foreground font-mono">{articulo.codigo}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-center tabular-nums text-sm font-semibold">{articulo.stockTotal}</td>
        <td className="px-3 py-2.5 text-center"><SemaforoBadge estado={articulo.estadoAgregado} /></td>
        <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{articulo.variantes.length} variantes</td>
      </tr>
      {expandido && articulo.variantes.map((v) => (
        <FilaVariante key={v.id} v={v} />
      ))}
    </>
  );
}

export default function DashboardPage() {
  const { data: anclas = [], isLoading } = useGetDashboardAnclasQuery();

  if (isLoading) return <SkeletonTable />;

  const resumen = {
    rojo: anclas.filter((a) => a.estadoAgregado === 'ROJO').length,
    amarillo: anclas.filter((a) => a.estadoAgregado === 'AMARILLO').length,
    verde: anclas.filter((a) => a.estadoAgregado === 'VERDE').length,
  };

  return (
    <>
      <PageTitle title="Dashboard — Artículos Ancla" />

      {anclas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <p className="text-sm">No hay artículos marcados como ancla.</p>
          <p className="text-xs">Marcá artículos como ancla desde su ficha de información.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="gap-1.5 text-sm px-3 py-1 bg-red-50 border-red-200 text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {resumen.rojo} crítico{resumen.rojo !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-sm px-3 py-1 bg-yellow-50 border-yellow-200 text-yellow-700">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              {resumen.amarillo} en atención
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-sm px-3 py-1 bg-green-50 border-green-200 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {resumen.verde} normal{resumen.verde !== 1 ? 'es' : ''}
            </Badge>
          </div>

          {/* Tabla */}
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-3 py-2.5 text-left font-medium text-xs">Artículo</th>
                  <th className="px-3 py-2.5 text-center font-medium text-xs">Stock total</th>
                  <th className="px-3 py-2.5 text-center font-medium text-xs">Estado</th>
                  <th className="px-3 py-2.5 text-center font-medium text-xs" />
                </tr>
              </thead>
              <thead className="hidden" aria-hidden>
                <tr>
                  <th className="pl-10">Talle</th>
                  <th>Color</th>
                  <th>Stock</th>
                  <th className="text-red-600">Mín</th>
                  <th className="text-yellow-600">Seg</th>
                  <th className="text-green-600">Máx</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {anclas.map((a) => (
                  <FilaArticulo key={a.id} articulo={a} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
