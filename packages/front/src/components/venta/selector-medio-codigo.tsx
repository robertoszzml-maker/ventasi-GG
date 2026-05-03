'use client';

import React from 'react';
import { MedioPago } from '@/types';
import { fetchPorCodigo } from '@/services/medio-pago';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SelectorMedioCodigoProps {
  onSeleccionar: (medio: MedioPago) => void;
  medioCargado?: MedioPago;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function SelectorMedioCodigo({ onSeleccionar, medioCargado, inputRef }: SelectorMedioCodigoProps) {
  const [valor, setValor] = React.useState('');
  const [error, setError] = React.useState('');
  const [buscando, setBuscando] = React.useState(false);
  const localRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  React.useEffect(() => {
    if (!medioCargado) {
      setValor('');
      setError('');
    }
  }, [medioCargado]);

  const buscar = async (codigo: string) => {
    if (!codigo.trim()) return;
    setBuscando(true);
    setError('');
    try {
      const medio = await fetchPorCodigo(codigo.trim());
      onSeleccionar(medio);
      setValor('');
    } catch {
      setError('Medio no encontrado');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          ref={ref}
          type="text"
          value={valor}
          onChange={(e) => { setValor(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); buscar(valor); }
            if (e.key === 'Escape') { setValor(''); setError(''); }
          }}
          placeholder="Código (V3, EF…)"
          maxLength={4}
          className={cn(
            'w-28 h-9 px-3 rounded-md border bg-background font-mono text-sm uppercase tracking-widest',
            'outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow',
            error ? 'border-destructive focus:ring-destructive/30' : 'border-input',
          )}
          disabled={buscando}
        />
        {buscando && <span className="text-xs text-muted-foreground self-center">Buscando…</span>}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {medioCargado && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="font-mono text-xs">{medioCargado.codigo}</Badge>
          <span className="text-xs text-muted-foreground">{medioCargado.nombre}</span>
          {medioCargado.cuotas > 1 && (
            <Badge variant="outline" className="text-xs">{medioCargado.cuotas} cuotas</Badge>
          )}
        </div>
      )}
    </div>
  );
}
