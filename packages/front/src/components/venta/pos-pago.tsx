'use client';

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { VentaFormaPago, CuotaMetodoPago } from '@/types';
import { useGetMetodosPagoQuery } from '@/hooks/metodo-pago';
import { InputMoney } from '@/components/input-money';
import { cn } from '@/lib/utils';

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PosPagoProps {
  formasPago: VentaFormaPago[];
  totalVenta: number;
  onAdd: (fp: Omit<VentaFormaPago, 'id' | 'ventaId'>) => void;
  onRemove: (index: number) => void;
}

export function PosPago({ formasPago, totalVenta, onAdd, onRemove }: PosPagoProps) {
  const { data: metodos = [] } = useGetMetodosPagoQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const [metodoPagoId, setMetodoPagoId] = React.useState('');
  const [cuotaId, setCuotaId] = React.useState<string>('contado');
  const [monto, setMonto] = React.useState('');
  const montoInputRef = React.useRef<HTMLInputElement>(null);

  const metodosActivos = metodos.filter((m) => m.activo);
  const totalPagado = formasPago.reduce((acc, fp) => acc + parseFloat(fp.montoConInteres || '0'), 0);
  const saldo = totalVenta - totalPagado;
  const cubierto = saldo <= 0.005;

  const metodoSeleccionado = metodosActivos.find((m) => String(m.id) === metodoPagoId);
  const cuotasActivas = (metodoSeleccionado?.cuotas ?? []).filter((c) => c.activo);
  const cuotaSeleccionada: CuotaMetodoPago | undefined =
    cuotaId !== 'contado' ? cuotasActivas.find((c) => String(c.id) === cuotaId) : undefined;

  const tasa = parseFloat(cuotaSeleccionada?.tasaInteres ?? '0');
  const montoBase = parseFloat(monto || '0');
  const montoConInteres = montoBase > 0 ? montoBase * (1 + tasa / 100) : 0;

  const seleccionarMetodo = (id: string) => {
    setMetodoPagoId(id);
    setCuotaId('contado');
    setMonto(saldo > 0.005 ? saldo.toFixed(2) : '');
    setTimeout(() => montoInputRef.current?.focus(), 50);
  };

  const confirmarPago = () => {
    if (!metodoSeleccionado || !monto || montoBase <= 0) return;

    onAdd({
      metodoPagoId: metodoSeleccionado.id!,
      cuotaMetodoPagoId: cuotaSeleccionada?.id,
      cantidadCuotas: cuotaSeleccionada?.cantidadCuotas ?? 1,
      tasaInteres: cuotaSeleccionada?.tasaInteres ?? '0',
      montoBase: montoBase.toFixed(2),
      montoConInteres: montoConInteres.toFixed(2),
      metodoPago: metodoSeleccionado,
      cuotaMetodoPago: cuotaSeleccionada,
    });

    setMetodoPagoId('');
    setCuotaId('contado');
    setMonto('');
  };

  const cancelarSeleccion = () => {
    setMetodoPagoId('');
    setCuotaId('contado');
    setMonto('');
  };

  const etiquetaCuota = (fp: VentaFormaPago) => {
    if (!fp.cuotaMetodoPago && fp.cantidadCuotas <= 1) return null;
    const tasa = parseFloat(fp.tasaInteres ?? '0');
    return `${fp.cantidadCuotas}x${tasa > 0 ? ` +${fp.tasaInteres}%` : ' sin interés'}`;
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/10">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forma de pago</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Pagos ya cargados */}
        {formasPago.length > 0 && (
          <div className="space-y-1.5">
            {formasPago.map((fp, i) => {
              const label = etiquetaCuota(fp);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted/30 border border-transparent px-3 py-2 group"
                >
                  <div>
                    <p className="text-sm font-medium">{fp.metodoPago?.nombre ?? `Método #${fp.metodoPagoId}`}</p>
                    {label && <p className="text-xs text-muted-foreground">{label}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      {parseFloat(fp.tasaInteres ?? '0') > 0 && (
                        <p className="text-xs text-muted-foreground line-through">${fmt(parseFloat(fp.montoBase))}</p>
                      )}
                      <p className="text-sm font-bold tabular-nums">${fmt(parseFloat(fp.montoConInteres))}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Indicador de saldo */}
            <div className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold',
              cubierto
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-destructive/5 text-destructive border border-destructive/20',
            )}>
              <div className="flex items-center gap-1.5">
                {cubierto && <CheckCircle2 className="h-4 w-4" />}
                <span>{cubierto ? 'Saldo cubierto' : 'Pendiente'}</span>
              </div>
              <span className="tabular-nums">${fmt(Math.abs(saldo))}</span>
            </div>
          </div>
        )}

        {/* Pills de métodos */}
        {(!cubierto || formasPago.length === 0) && (
          <>
            <div className="flex flex-wrap gap-2">
              {metodosActivos.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => seleccionarMetodo(String(m.id))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
                    metodoPagoId === String(m.id)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted',
                  )}
                >
                  {m.nombre}
                </button>
              ))}
            </div>

            {/* Selector de cuotas — solo si el método tiene cuotas */}
            {metodoPagoId && cuotasActivas.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Cuotas</p>
                <div className="flex flex-wrap gap-1.5">
                  {/* Contado */}
                  <button
                    type="button"
                    onClick={() => setCuotaId('contado')}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
                      cuotaId === 'contado'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted',
                    )}
                  >
                    1x sin interés
                  </button>
                  {cuotasActivas.map((c) => {
                    const t = parseFloat(c.tasaInteres ?? '0');
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCuotaId(String(c.id))}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
                          cuotaId === String(c.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted',
                        )}
                      >
                        {c.cantidadCuotas}x
                        {t > 0
                          ? <span className="ml-1 opacity-80">+{c.tasaInteres}%</span>
                          : <span className="ml-1 opacity-60">sin int.</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Campo de monto */}
            {metodoPagoId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <InputMoney
                      ref={montoInputRef}
                      value={monto}
                      placeholder="0,00"
                      className="h-10 font-semibold tabular-nums"
                      onChange={(v) => setMonto(v)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmarPago()}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={confirmarPago}
                    disabled={!monto || montoBase <= 0}
                    className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={cancelarSeleccion}
                    className="h-10 px-2 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Alerta de interés */}
                {tasa > 0 && montoBase > 0 && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                    Con interés: <span className="font-bold">${fmt(montoConInteres)}</span>
                    <span className="ml-1 opacity-70">(+{tasa}%)</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
