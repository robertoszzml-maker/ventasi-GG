'use client';

import React from 'react';
import { MedioPago } from '@/types';
import { InputMoney } from '@/components/input-money';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormCobroProps {
  medio: MedioPago | undefined;
  saldoRestante: number;
  onAgregar: (datos: {
    monto: string;
    codigoAutorizacion?: string;
    ultimos4?: string;
    vuelto?: string;
  }) => void;
  onCancelar: () => void;
  montoInputRef?: React.RefObject<HTMLInputElement>;
}

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function FormCobro({ medio, saldoRestante, onAgregar, onCancelar, montoInputRef }: FormCobroProps) {
  const [monto, setMonto] = React.useState('');
  const [codigoAutorizacion, setCodigoAutorizacion] = React.useState('');
  const [ultimos4, setUltimos4] = React.useState('');
  const [billeteEntregado, setBilleteEntregado] = React.useState('');

  React.useEffect(() => {
    if (medio && saldoRestante > 0) {
      setMonto(saldoRestante.toFixed(2));
    }
    setCodigoAutorizacion('');
    setUltimos4('');
    setBilleteEntregado('');
  }, [medio]);

  const esTarjeta = medio?.tipo === 'CREDITO' || medio?.tipo === 'DEBITO';
  const esEfectivo = medio?.tipo === 'EFECTIVO';
  const montoNum = parseFloat(monto || '0');
  const billeteNum = parseFloat(billeteEntregado || '0');
  const vueltoNum = esEfectivo && billeteNum > montoNum ? billeteNum - montoNum : 0;

  const puedeAgregar =
    montoNum > 0 &&
    (!esTarjeta || codigoAutorizacion.trim().length > 0) &&
    (esEfectivo || montoNum <= saldoRestante + 0.005);

  const confirmar = () => {
    if (!puedeAgregar) return;
    onAgregar({
      monto: montoNum.toFixed(4),
      codigoAutorizacion: codigoAutorizacion || undefined,
      ultimos4: ultimos4 || undefined,
      vuelto: vueltoNum > 0 ? vueltoNum.toFixed(4) : undefined,
    });
    setMonto('');
    setCodigoAutorizacion('');
    setUltimos4('');
    setBilleteEntregado('');
  };

  if (!medio) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Monto</Label>
          <InputMoney
            ref={montoInputRef}
            value={monto}
            onChange={setMonto}
            placeholder="0,00"
            className="h-10 font-semibold tabular-nums"
            onKeyDown={(e) => e.key === 'Enter' && confirmar()}
          />
          {!esEfectivo && montoNum > saldoRestante + 0.005 && (
            <p className="text-xs text-destructive mt-1">Máximo: ${fmt(saldoRestante)}</p>
          )}
        </div>

        {esTarjeta && (
          <>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Autorización *</Label>
              <Input
                value={codigoAutorizacion}
                onChange={(e) => setCodigoAutorizacion(e.target.value)}
                placeholder="123456"
                className="h-10"
                onKeyDown={(e) => e.key === 'Enter' && confirmar()}
              />
            </div>
            <div className="w-24">
              <Label className="text-xs text-muted-foreground mb-1 block">Últimos 4</Label>
              <Input
                value={ultimos4}
                onChange={(e) => setUltimos4(e.target.value.slice(0, 4))}
                placeholder="4532"
                maxLength={4}
                inputMode="numeric"
                className="h-10"
                onKeyDown={(e) => e.key === 'Enter' && confirmar()}
              />
            </div>
          </>
        )}
      </div>

      {esEfectivo && montoNum > 0 && (
        <div className="flex items-end gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Billete entregado</Label>
            <InputMoney
              value={billeteEntregado}
              onChange={setBilleteEntregado}
              placeholder="0,00"
              className="h-9"
            />
          </div>
          {vueltoNum > 0 && (
            <div className="text-right pb-0.5">
              <p className="text-xs text-muted-foreground">Vuelto</p>
              <p className="text-lg font-bold text-emerald-600 tabular-nums">${fmt(vueltoNum)}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={confirmar}
          disabled={!puedeAgregar}
          className={cn(
            'flex-1 h-10 rounded-md text-sm font-semibold transition-colors',
            puedeAgregar
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
        >
          + Agregar cobro
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="h-10 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
