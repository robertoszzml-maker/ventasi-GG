'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  Search,
  ShoppingCart,
  TrendingUp,
  FileCheck,
  FileX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGetVentasQuery } from '@/hooks/venta';
import { Venta } from '@/types';
import { cn } from '@/lib/utils';

const ESTADO_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  borrador: {
    label: 'Borrador',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  confirmada: {
    label: 'Confirmada',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  anulada: {
    label: 'Anulada',
    dot: 'bg-red-400',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
};

const ESTADO_FILTROS = [
  { value: '', label: 'Todas' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'anulada', label: 'Anulada' },
];

function fmt(v: string | number) {
  return parseFloat(String(v || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

function EstadoBadge({ estado }: { estado?: string }) {
  const cfg = ESTADO_CONFIG[estado ?? 'borrador'] ?? {
    label: estado,
    dot: 'bg-gray-400',
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.badge)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function ComprobantePill({ venta }: { venta: Venta }) {
  const comp = venta.comprobante;
  if (!comp) return <span className="text-xs text-muted-foreground italic">Sin emitir</span>;
  const emitido = comp.estado === 'emitido';
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', emitido ? 'text-emerald-600' : 'text-amber-600')}>
      {emitido ? <FileCheck className="h-3.5 w-3.5" /> : <FileX className="h-3.5 w-3.5" />}
      {comp.tipo === 'fiscal' ? 'Fiscal' : 'Manual'}
      {comp.numero ? ` · ${String(comp.numero).padStart(8, '0')}` : ''}
    </span>
  );
}

function VentaRow({ venta }: { venta: Venta }) {
  const router = useRouter();
  return (
    <tr
      className="group hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
      onClick={() => router.push(`/ventas/${venta.id}`)}
    >
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
        <span className="group-hover:text-foreground transition-colors">#{String(venta.id).padStart(5, '0')}</span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{venta.fecha}</td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium leading-tight">{venta.cliente?.nombre ?? `Cliente #${venta.clienteId}`}</p>
        {venta.cliente?.condicionIva && (
          <p className="text-xs text-muted-foreground mt-0.5">{venta.cliente.condicionIva}</p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {venta.vendedor ? `${venta.vendedor.nombre} ${venta.vendedor.apellido}` : '—'}
      </td>
      <td className="px-4 py-3">
        <EstadoBadge estado={venta.estado} />
      </td>
      <td className="px-4 py-3">
        <ComprobantePill venta={venta} />
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-bold tabular-nums">${fmt(venta.total)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); router.push(`/ventas/${venta.id}`); }}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[40, 64, 160, 120, 80, 100, 80, 32].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 rounded`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function VentasPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [estado, setEstado] = React.useState('');
  const [page, setPage] = React.useState(0);
  const pageSize = 20;

  const filters = React.useMemo(() => {
    const f = [];
    if (estado) f.push({ id: 'estado', value: estado });
    return f;
  }, [estado]);

  const { data: ventas = [], isLoading } = useGetVentasQuery({
    pagination: { pageIndex: page, pageSize },
    globalFilter: search,
    columnFilters: filters,
  });

  const totalMostrado = ventas.reduce((acc, v) => acc + parseFloat(v.total || '0'), 0);
  const countConfirmadas = ventas.filter((v) => v.estado === 'confirmada').length;
  const countBorradores = ventas.filter((v) => v.estado === 'borrador').length;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageTitle title="Ventas" />
        <Button onClick={() => router.push('/ventas/nueva')} size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Nueva venta
        </Button>
      </div>

      {/* KPI strip */}
      {!isLoading && ventas.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total mostrado</p>
              <p className="text-sm font-bold tabular-nums">${fmt(totalMostrado)}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <FileCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confirmadas</p>
              <p className="text-sm font-bold">{countConfirmadas}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Borradores</p>
              <p className="text-sm font-bold">{countBorradores}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-9"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
          {ESTADO_FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setEstado(f.value); setPage(0); }}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                estado === f.value
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendedor</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comprobante</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="px-4 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="font-medium">No hay ventas{search ? ` para "${search}"` : ''}</p>
                    {!search && (
                      <Button variant="outline" size="sm" onClick={() => router.push('/ventas/nueva')}>
                        Crear la primera venta
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              ventas.map((v) => <VentaRow key={v.id} venta={v} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(page > 0 || ventas.length === pageSize) && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground px-2">Página {page + 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={ventas.length < pageSize}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
