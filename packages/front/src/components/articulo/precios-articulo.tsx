'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputMoney } from '@/components/input-money';
import { useGetArticulosPrecioByArticuloQuery, useEditArticuloPrecioMutation } from '@/hooks/articulo-precio';
import { useEditArticulosMutation } from '@/hooks/articulos';
import { useToast } from '@/hooks/use-toast';
import { SkeletonTable } from '@/components/skeletons/skeleton-table';
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import { Articulo } from '@/types';
import { Lock, TrendingUp } from 'lucide-react';

interface PreciosArticuloProps {
  articulo: Articulo;
}

export function PreciosArticulo({ articulo }: PreciosArticuloProps) {
  const puedeVerCosto = hasPermission(PERMISOS.ARTICULO_VER_COSTO);
  const puedeEditarCosto = hasPermission(PERMISOS.ARTICULO_EDITAR_COSTO);

  const { data: precios = [], isLoading } = useGetArticulosPrecioByArticuloQuery(articulo.id!);
  const { mutate: guardarPrecio, isPending: guardandoPrecio } = useEditArticuloPrecioMutation();
  const { mutate: guardarCosto, isPending: guardandoCosto } = useEditArticulosMutation();
  const { toast } = useToast();

  const [cambiosPrecios, setCambiosPrecios] = React.useState<Record<number, number>>({});
  const [costoLocal, setCostoLocal] = React.useState<number>(articulo.costo ?? 0);

  React.useEffect(() => {
    setCostoLocal(articulo.costo ?? 0);
  }, [articulo.costo]);

  const handlePrecioChange = (id: number, valor: number) => {
    setCambiosPrecios((prev) => ({ ...prev, [id]: valor }));
  };

  const handleGuardarPrecio = (id: number) => {
    const precio = cambiosPrecios[id];
    if (precio === undefined) return;
    guardarPrecio(
      { id, precio },
      {
        onSuccess: () => {
          setCambiosPrecios((prev) => { const next = { ...prev }; delete next[id]; return next; });
          toast({ title: 'Precio actualizado' });
        },
        onError: () => toast({ title: 'Error al guardar precio', variant: 'destructive' }),
      },
    );
  };

  const handleGuardarCosto = () => {
    guardarCosto(
      { id: articulo.id!, data: { costo: costoLocal } as Articulo },
      {
        onSuccess: () => toast({ title: 'Costo actualizado' }),
        onError: () => toast({ title: 'Error al guardar costo', variant: 'destructive' }),
      },
    );
  };

  if (isLoading) return <SkeletonTable />;

  return (
    <div className="space-y-6">
      {/* Costo interno */}
      {puedeVerCosto && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Costo interno
            </span>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <p className="text-xs text-muted-foreground mb-1.5">Costo del artículo</p>
              <InputMoney
                value={costoLocal}
                onChange={setCostoLocal}
                disabled={!puedeEditarCosto}
              />
            </div>
            {puedeEditarCosto && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGuardarCosto}
                disabled={guardandoCosto}
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950"
              >
                {guardandoCosto ? 'Guardando...' : 'Guardar costo'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Precios por lista */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Precios por lista
          </span>
        </div>

        {precios.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No hay listas de precios disponibles.</p>
        ) : (
          <div className="space-y-2">
            {precios.map((p) => {
              const valorActual = cambiosPrecios[p.id!] ?? p.precio;
              const tieneCambio = cambiosPrecios[p.id!] !== undefined;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors ${
                    tieneCambio
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{p.listaPrecio?.nombre}</span>
                    {p.listaPrecio?.esDefault === 1 && (
                      <Badge variant="secondary" className="text-xs shrink-0">Predeterminada</Badge>
                    )}
                    {tieneCambio && (
                      <span className="text-xs text-primary shrink-0">sin guardar</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <InputMoney
                      value={valorActual}
                      onChange={(valor) => handlePrecioChange(p.id!, valor)}
                      className="w-36"
                    />
                    <Button
                      size="sm"
                      variant={tieneCambio ? 'default' : 'outline'}
                      onClick={() => handleGuardarPrecio(p.id!)}
                      disabled={guardandoPrecio || !tieneCambio}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
