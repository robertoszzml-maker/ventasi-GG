'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Venta } from '@/types';
import { useGetVendedoresQuery } from '@/hooks/vendedor';
import { useGetListasPrecioQuery } from '@/hooks/lista-precio';
import { useGetClientesQuery } from '@/hooks/cliente';
import { cn } from '@/lib/utils';
import { User, UserCheck, Tag, FileText } from 'lucide-react';

const TIPOS_COMPROBANTE = [
  { value: 'A', label: 'Factura A', hint: 'RI → RI' },
  { value: 'B', label: 'Factura B', hint: 'RI → CF' },
  { value: 'C', label: 'Factura C', hint: 'Monotributo' },
  { value: 'X', label: 'Comp. X', hint: 'Sin factura' },
];

const CONDICION_IVA_SUGERENCIA: Record<string, string> = {
  RI: 'A',
  CF: 'B',
  MT: 'B',
  EX: 'B',
};

const CONDICION_BADGE: Record<string, string> = {
  RI: 'bg-blue-50 text-blue-700 border-blue-200',
  CF: 'bg-gray-50 text-gray-600 border-gray-200',
  MT: 'bg-violet-50 text-violet-700 border-violet-200',
  EX: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface VentaCabeceraProps {
  venta: Partial<Venta>;
  onChange: (patch: Partial<Venta>) => void;
  readonly?: boolean;
}

function FieldWrapper({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

export function VentaCabecera({ venta, onChange, readonly }: VentaCabeceraProps) {
  const { data: clientes = [] } = useGetClientesQuery({ pagination: { pageIndex: 0, pageSize: 500 } });
  const { data: vendedores = [] } = useGetVendedoresQuery({ pagination: { pageIndex: 0, pageSize: 200 } });
  const { data: listas = [] } = useGetListasPrecioQuery({ pagination: { pageIndex: 0, pageSize: 100 } });

  const clienteSeleccionado = clientes.find((c) => c.id === venta.clienteId);
  const vendedoresActivos = vendedores.filter((v) => v.activo);

  React.useEffect(() => {
    if (clienteSeleccionado?.condicionIva && !venta.tipoComprobante) {
      const sugerido = CONDICION_IVA_SUGERENCIA[clienteSeleccionado.condicionIva] ?? 'B';
      onChange({ tipoComprobante: sugerido });
    }
  }, [clienteSeleccionado?.condicionIva]);

  const condIva = clienteSeleccionado?.condicionIva ?? venta.cliente?.condicionIva;
  const tipoComp = TIPOS_COMPROBANTE.find((t) => t.value === venta.tipoComprobante);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Datos de la venta</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-4">
        {/* Cliente */}
        <FieldWrapper icon={<User className="h-3 w-3" />} label="Cliente">
          {readonly ? (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{venta.cliente?.nombre ?? clienteSeleccionado?.nombre ?? '—'}</p>
              {condIva && (
                <span className={cn('inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium', CONDICION_BADGE[condIva] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
                  {condIva}
                </span>
              )}
            </div>
          ) : (
            <Select
              value={venta.clienteId ? String(venta.clienteId) : undefined}
              onValueChange={(v) => onChange({ clienteId: Number(v), tipoComprobante: undefined })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <div className="flex items-center gap-2">
                      <span>{c.nombre}</span>
                      {c.condicionIva && (
                        <span className={cn('inline-flex items-center rounded border px-1 text-xs', CONDICION_BADGE[c.condicionIva] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
                          {c.condicionIva}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        {/* Vendedor */}
        <FieldWrapper icon={<UserCheck className="h-3 w-3" />} label="Vendedor">
          {readonly ? (
            <p className="text-sm font-medium">
              {venta.vendedor
                ? `${venta.vendedor.nombre} ${venta.vendedor.apellido}`
                : '—'}
            </p>
          ) : (
            <Select
              value={venta.vendedorId ? String(venta.vendedorId) : undefined}
              onValueChange={(v) => onChange({ vendedorId: Number(v) })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedoresActivos.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    <span>{v.nombre} {v.apellido}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground font-mono">({v.codigo})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        {/* Lista de precios */}
        <FieldWrapper icon={<Tag className="h-3 w-3" />} label="Lista de precios">
          {readonly ? (
            <p className="text-sm font-medium">{venta.listaPrecio?.nombre ?? '—'}</p>
          ) : (
            <Select
              value={venta.listaPrecioId ? String(venta.listaPrecioId) : undefined}
              onValueChange={(v) => onChange({ listaPrecioId: Number(v) })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar lista" />
              </SelectTrigger>
              <SelectContent>
                {listas.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    <span>{l.nombre}</span>
                    {l.esDefault === 1 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-1 rounded">Default</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        {/* Tipo de comprobante */}
        <FieldWrapper icon={<FileText className="h-3 w-3" />} label="Tipo de comprobante">
          {readonly ? (
            <p className="text-sm font-medium">
              {tipoComp ? `${tipoComp.label} · ${tipoComp.hint}` : (venta.tipoComprobante ?? '—')}
            </p>
          ) : (
            <div className="space-y-1">
              <Select
                value={venta.tipoComprobante}
                onValueChange={(v) => onChange({ tipoComprobante: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_COMPROBANTE.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="font-medium">{t.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{t.hint}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {condIva && !venta.tipoComprobante && (
                <p className="text-xs text-muted-foreground">
                  Sugerido: <span className="font-medium">{CONDICION_IVA_SUGERENCIA[condIva] ?? 'B'}</span> para {condIva}
                </p>
              )}
            </div>
          )}
        </FieldWrapper>
      </div>
    </div>
  );
}
