'use client';

import React from 'react';
import { Cobro, MedioPago } from '@/types';
import { useGetMediosPagoActivosQuery } from '@/hooks/medio-pago';
import { useCrearCobroMutation, useEliminarCobroMutation } from '@/hooks/cobro';
import { GrillaMediosPago } from './grilla-medios-pago';
import { SelectorMedioCodigo } from './selector-medio-codigo';
import { FormCobro } from './form-cobro';
import { ListaCobros } from './lista-cobros';

interface PanelCobrosProps {
  ventaId: number | undefined;
  cobros: Cobro[];
  sumaMontos: number;
  totalVenta: number;
}

export function PanelCobros({ ventaId, cobros, sumaMontos, totalVenta }: PanelCobrosProps) {
  const { data: mediosActivos = [] } = useGetMediosPagoActivosQuery();
  const crearCobro = useCrearCobroMutation();
  const eliminarCobro = useEliminarCobroMutation();

  const [medioSeleccionado, setMedioSeleccionado] = React.useState<MedioPago | undefined>();
  const montoInputRef = React.useRef<HTMLInputElement>(null);

  const saldoRestante = totalVenta - sumaMontos;
  const cubierto = saldoRestante <= 0.01;

  const seleccionarMedio = (medio: MedioPago) => {
    setMedioSeleccionado(medio);
    setTimeout(() => montoInputRef.current?.focus(), 50);
  };

  const agregarCobro = async (datos: {
    monto: string;
    codigoAutorizacion?: string;
    ultimos4?: string;
    vuelto?: string;
  }) => {
    if (!ventaId || !medioSeleccionado) return;
    await crearCobro.mutateAsync({
      ventaId,
      medioPagoId: medioSeleccionado.id!,
      ...datos,
    });
    setMedioSeleccionado(undefined);
  };

  const eliminar = (cobro: Cobro) => {
    if (!cobro.id || !ventaId) return;
    eliminarCobro.mutate({ id: cobro.id, ventaId });
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/10">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cobros</p>
      </div>

      <div className="p-4 space-y-4">
        {cobros.length > 0 && (
          <ListaCobros
            cobros={cobros}
            sumaMontos={sumaMontos}
            totalVenta={totalVenta}
            onEliminar={eliminar}
          />
        )}

        {!cubierto && (
          <>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Código rápido</p>
              <SelectorMedioCodigo
                onSeleccionar={seleccionarMedio}
                medioCargado={medioSeleccionado}
              />
            </div>

            {mediosActivos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">O seleccioná</p>
                <GrillaMediosPago
                  medios={mediosActivos}
                  onSeleccionar={seleccionarMedio}
                  medioCodigo={medioSeleccionado?.codigo}
                />
              </div>
            )}

            <FormCobro
              medio={medioSeleccionado}
              saldoRestante={saldoRestante}
              onAgregar={agregarCobro}
              onCancelar={() => setMedioSeleccionado(undefined)}
              montoInputRef={montoInputRef}
            />
          </>
        )}
      </div>
    </div>
  );
}
