'use client';

import React from 'react';
import { VentaFormaPago } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, CreditCard, Wallet, ChevronRight } from 'lucide-react';
import { useGetMetodosPagoQuery } from '@/hooks/metodo-pago';
import { cn } from '@/lib/utils';

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface VentaFormasPagoProps {
  formasPago: VentaFormaPago[];
  totalVenta: number;
  onAdd: (forma: Omit<VentaFormaPago, 'id' | 'ventaId'>) => void;
  onRemove: (index: number) => void;
  readonly?: boolean;
}

export function VentaFormasPago({ formasPago, totalVenta, onAdd, onRemove, readonly }: VentaFormasPagoProps) {
  const { data: metodos = [] } = useGetMetodosPagoQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const [metodoPagoId, setMetodoPagoId] = React.useState('');
  const [cuotaId, setCuotaId] = React.useState('');
  const [monto, setMonto] = React.useState('');

  const metodoSeleccionado = metodos.find((m) => m.id === parseInt(metodoPagoId));
  const cuotasActivas = (metodoSeleccionado?.cuotas ?? []).filter((c) => c.activo);
  const cuotaSeleccionada = cuotaId && cuotaId !== 'contado' ? cuotasActivas.find((c) => c.id === parseInt(cuotaId)) : undefined;

  const totalPagado = formasPago.reduce((acc, fp) => acc + parseFloat(fp.montoConInteres || '0'), 0);
  const saldo = totalVenta - totalPagado;
  const cubierto = saldo <= 0.005;
  const saldoPct = totalVenta > 0 ? Math.min(100, (totalPagado / totalVenta) * 100) : 0;

  const tasaAplicable = cuotaSeleccionada?.tasaInteres ? parseFloat(cuotaSeleccionada.tasaInteres) : 0;
  const montoBase = parseFloat(monto || '0');
  const montoConInteres = montoBase * (1 + tasaAplicable / 100);

  const handleAgregar = () => {
    if (!metodoPagoId || !monto || parseFloat(monto) <= 0) return;

    onAdd({
      metodoPagoId: parseInt(metodoPagoId),
      cuotaMetodoPagoId: cuotaId && cuotaId !== 'contado' ? parseInt(cuotaId) : undefined,
      cantidadCuotas: cuotaSeleccionada?.cantidadCuotas ?? 1,
      tasaInteres: cuotaSeleccionada?.tasaInteres ?? '0',
      montoBase: montoBase.toFixed(2),
      montoConInteres: montoConInteres.toFixed(2),
      metodoPago: metodoSeleccionado,
      cuotaMetodoPago: cuotaSeleccionada,
    });

    setMetodoPagoId('');
    setCuotaId('');
    setMonto('');
  };

  const usarSaldo = () => {
    if (saldo > 0) setMonto(saldo.toFixed(2));
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b bg-muted/20 flex items-center gap-2">
        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Formas de pago</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Pagos cargados */}
        {formasPago.length > 0 && (
          <div className="space-y-1.5">
            {formasPago.map((fp, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded-lg bg-muted/30 border border-transparent hover:border-border/50 px-3 py-2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none">
                    {fp.metodoPago?.nombre ?? `Método #${fp.metodoPagoId}`}
                  </p>
                  {fp.cantidadCuotas > 1 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fp.cantidadCuotas} cuotas
                      {parseFloat(fp.tasaInteres) > 0 ? ` · +${fp.tasaInteres}%` : ' · sin interés'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    {parseFloat(fp.tasaInteres) > 0 && (
                      <p className="text-xs text-muted-foreground line-through">${fmt(parseFloat(fp.montoBase))}</p>
                    )}
                    <p className="text-sm font-bold tabular-nums">${fmt(parseFloat(fp.montoConInteres))}</p>
                  </div>
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      onClick={() => onRemove(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Separator />

            {/* Resumen saldo */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total pagado</span>
                <span className="tabular-nums font-medium">${fmt(totalPagado)}</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-300', cubierto ? 'bg-emerald-500' : 'bg-primary')}
                  style={{ width: `${saldoPct}%` }}
                />
              </div>

              <div className={cn(
                'flex justify-between text-sm font-semibold',
                cubierto ? 'text-emerald-600' : 'text-destructive',
              )}>
                <span>{cubierto ? '✓ Saldo cubierto' : `Saldo pendiente`}</span>
                <span className="tabular-nums">${fmt(Math.abs(saldo))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulario agregar pago */}
        {!readonly && (
          <div className={cn('space-y-2.5', formasPago.length > 0 && 'pt-1')}>
            {formasPago.length > 0 && (
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Agregar otro pago
              </p>
            )}

            <Select value={metodoPagoId} onValueChange={(v) => { setMetodoPagoId(v); setCuotaId(''); }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                {metodos.filter((m) => m.activo).map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                      {m.nombre}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {cuotasActivas.length > 0 && (
              <Select value={cuotaId} onValueChange={setCuotaId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Cuotas (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contado">
                    <div className="flex items-center gap-1.5">
                      <span>1 cuota</span>
                      <span className="text-xs text-muted-foreground">sin interés</span>
                    </div>
                  </SelectItem>
                  {cuotasActivas.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{c.cantidadCuotas}x</span>
                        {parseFloat(c.tasaInteres ?? '0') > 0 ? (
                          <span className="text-xs text-amber-600">
                            +{c.tasaInteres}%
                            {montoBase > 0 && ` = $${fmt(montoBase * (1 + parseFloat(c.tasaInteres!) / 100))}`}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">sin interés</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto"
                className="h-9 text-sm flex-1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
              {saldo > 0.005 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs shrink-0 gap-1"
                  onClick={usarSaldo}
                >
                  <ChevronRight className="h-3 w-3" />
                  Saldo
                </Button>
              )}
            </div>

            {montoBase > 0 && tasaAplicable > 0 && (
              <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                Total con interés: <span className="font-bold">${fmt(montoConInteres)}</span>
                <span className="text-amber-500 ml-1">({tasaAplicable}%)</span>
              </div>
            )}

            <Button
              size="sm"
              className="w-full h-9"
              onClick={handleAgregar}
              disabled={!metodoPagoId || !monto || parseFloat(monto) <= 0}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Agregar pago
            </Button>
          </div>
        )}

        {/* Estado vacío */}
        {formasPago.length === 0 && readonly && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            Sin formas de pago registradas
          </div>
        )}
      </div>
    </div>
  );
}
