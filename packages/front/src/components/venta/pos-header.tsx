'use client';

import React from 'react';
import { Check, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Cliente, Venta } from '@/types';
import { useGetVendedoresQuery } from '@/hooks/vendedor';
import { useGetClientesQuery } from '@/hooks/cliente';
import { useGetListasPrecioQuery } from '@/hooks/lista-precio';

const TIPOS_COMPROBANTE = [
  { value: 'A', label: 'Factura A' },
  { value: 'B', label: 'Factura B' },
  { value: 'C', label: 'Factura C' },
  { value: 'X', label: 'Comp. X' },
];

const CONDICION_IVA_COMPROBANTE: Record<string, string> = {
  RI: 'A',
  CF: 'B',
  MT: 'B',
  EX: 'B',
};

export interface PosHeaderState {
  vendedorId?: number;
  clienteId?: number;
  cliente?: Cliente;
  listaPrecioId?: number;
  tipoComprobante?: string;
}

interface PosHeaderProps {
  state: PosHeaderState;
  onChange: (patch: Partial<PosHeaderState>) => void;
}

export function PosHeader({ state, onChange }: PosHeaderProps) {
  const { data: vendedores = [] } = useGetVendedoresQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const [busquedaCliente, setBusquedaCliente] = React.useState('');
  const [debouncedCliente, setDebouncedCliente] = React.useState('');
  const [clienteDropdownAbierto, setClienteDropdownAbierto] = React.useState(false);
  const [indiceDestacado, setIndiceDestacado] = React.useState(-1);
  const [comprobanteAbierto, setComprobanteAbierto] = React.useState(false);
  const clienteInputRef = React.useRef<HTMLInputElement>(null);
  const comprobanteRef = React.useRef<HTMLDivElement>(null);

  const { data: listas = [] } = useGetListasPrecioQuery({ pagination: { pageIndex: 0, pageSize: 100 } });

  React.useEffect(() => {
    const listaPorDefecto = listas.find((l) => l.esDefault === 1);
    if (listaPorDefecto && !state.listaPrecioId) {
      onChange({ listaPrecioId: listaPorDefecto.id });
    }
  }, [listas, state.listaPrecioId]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedCliente(busquedaCliente), 280);
    return () => clearTimeout(t);
  }, [busquedaCliente]);

  const { data: clientes = [] } = useGetClientesQuery({
    pagination: { pageIndex: 0, pageSize: 15 },
    globalFilter: debouncedCliente,
    enabled: debouncedCliente.length >= 2,
  });

  React.useEffect(() => {
    setIndiceDestacado(-1);
  }, [clientes, busquedaCliente]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comprobanteRef.current && !comprobanteRef.current.contains(e.target as Node)) {
        setComprobanteAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const vendedoresActivos = vendedores.filter((v) => v.activo);

  const seleccionarCliente = (cliente: Cliente) => {
    const comprobante = cliente.condicionIva
      ? (CONDICION_IVA_COMPROBANTE[cliente.condicionIva] ?? 'B')
      : (state.tipoComprobante ?? 'B');
    onChange({ clienteId: cliente.id, cliente, tipoComprobante: comprobante });
    setBusquedaCliente(cliente.nombre);
    setClienteDropdownAbierto(false);
  };

  const tipoComp = TIPOS_COMPROBANTE.find((t) => t.value === state.tipoComprobante);

  return (
    <div className="rounded-xl border bg-card shadow-sm p-3 flex flex-wrap gap-3 items-center">
      {/* Chips de vendedor */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {vendedoresActivos.map((v) => {
          const seleccionado = state.vendedorId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange({ vendedorId: v.id })}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
                seleccionado
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted',
              )}
            >
              {seleccionado && <Check className="h-3 w-3" />}
              {v.nombre} {v.apellido}
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-border hidden sm:block" />

      {/* Autocomplete de cliente */}
      <div className="relative flex-1 min-w-[220px]">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={clienteInputRef}
            type="text"
            placeholder="Buscar cliente..."
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
            value={busquedaCliente}
            onChange={(e) => {
              setBusquedaCliente(e.target.value);
              setClienteDropdownAbierto(true);
              if (!e.target.value) onChange({ clienteId: undefined, cliente: undefined });
            }}
            onFocus={() => setClienteDropdownAbierto(true)}
            onKeyDown={(e) => {
              if (!clienteDropdownAbierto || clientes.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndiceDestacado((i) => Math.min(i + 1, clientes.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndiceDestacado((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' || e.key === 'Tab') {
                const idx = indiceDestacado >= 0 ? indiceDestacado : 0;
                if (clientes[idx]) {
                  e.preventDefault();
                  seleccionarCliente(clientes[idx]);
                }
              } else if (e.key === 'Escape') {
                setClienteDropdownAbierto(false);
                setIndiceDestacado(-1);
              }
            }}
          />
        </div>

        {clienteDropdownAbierto && debouncedCliente.length >= 2 && clientes.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
            {clientes.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer',
                  i === indiceDestacado ? 'bg-muted' : 'hover:bg-muted',
                )}
                onMouseEnter={() => setIndiceDestacado(i)}
                onMouseDown={(e) => { e.preventDefault(); seleccionarCliente(c); }}
              >
                <span className="font-medium truncate">{c.nombre}</span>
                {c.condicionIva && (
                  <span className="text-xs text-muted-foreground shrink-0 font-mono">{c.condicionIva}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Badge de comprobante */}
      <div className="relative" ref={comprobanteRef}>
        <button
          type="button"
          onClick={() => setComprobanteAbierto((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
            state.tipoComprobante
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
          )}
        >
          {tipoComp ? tipoComp.label : 'Comprobante'}
          <ChevronDown className="h-3 w-3" />
        </button>

        {comprobanteAbierto && (
          <div className="absolute right-0 z-50 mt-1 w-36 rounded-md border bg-popover shadow-md overflow-hidden">
            {TIPOS_COMPROBANTE.map((t) => (
              <button
                key={t.value}
                type="button"
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between',
                  state.tipoComprobante === t.value && 'bg-primary/5 text-primary font-medium',
                )}
                onClick={() => { onChange({ tipoComprobante: t.value }); setComprobanteAbierto(false); }}
              >
                {t.label}
                {state.tipoComprobante === t.value && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
