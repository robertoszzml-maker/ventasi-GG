'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2, ChevronLeft, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { buscarArticulos, fetchGrillaConPrecio } from '@/services/articulo-venta';
import { VentaDetalle, ArticuloVariante } from '@/types';
import { cn } from '@/lib/utils';

interface VentaAgregarArticuloProps {
  open: boolean;
  onClose: () => void;
  listaPrecioId?: number;
  onAgregar: (detalle: Omit<VentaDetalle, 'id' | 'ventaId'>) => void;
}

function calcularSubtotal(precio: number, cantidad: number, descPct?: string, descMonto?: string): string {
  let sub = precio * cantidad;
  if (descPct) sub = sub * (1 - parseFloat(descPct) / 100);
  if (descMonto) sub = sub - parseFloat(descMonto);
  return sub.toFixed(2);
}

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

export function VentaAgregarArticulo({ open, onClose, listaPrecioId, onAgregar }: VentaAgregarArticuloProps) {
  const [busqueda, setBusqueda] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [articuloId, setArticuloId] = React.useState<number | null>(null);
  const [varianteId, setVarianteId] = React.useState<number | null>(null);
  const [cantidad, setCantidad] = React.useState('1');
  const [descPct, setDescPct] = React.useState('');
  const [descMonto, setDescMonto] = React.useState('');
  const [precioManual, setPrecioManual] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data: articulos = [], isFetching } = useQuery({
    queryKey: ['articulos-venta', debouncedSearch, listaPrecioId],
    queryFn: () => buscarArticulos(debouncedSearch, listaPrecioId),
    enabled: debouncedSearch.length >= 2,
  });

  const { data: grilla } = useQuery({
    queryKey: ['grilla-venta', articuloId, listaPrecioId],
    queryFn: () => fetchGrillaConPrecio(articuloId!, listaPrecioId),
    enabled: !!articuloId,
  });

  const articuloSeleccionado = articulos.find((a) => a.id === articuloId);

  const varianteSeleccionada = React.useMemo<ArticuloVariante | undefined>(() => {
    if (!grilla || !varianteId) return undefined;
    for (const celda of grilla.celdas) {
      if (celda.varianteId === varianteId) {
        return {
          id: celda.varianteId,
          articuloId: articuloId!,
          talleId: celda.talleId,
          colorId: 0,
          cantidad: celda.cantidad ?? '0',
          talle: { id: celda.talleId, codigo: celda.talleCodigo, nombre: celda.talleNombre },
        } as ArticuloVariante;
      }
    }
    return undefined;
  }, [grilla, varianteId, articuloId]);

  const precioBase = articuloSeleccionado?.precioDefault ?? 0;
  const precioFinal = precioBase > 0 ? precioBase : parseFloat(precioManual || '0');
  const cantidadNum = parseFloat(cantidad || '1');
  const subtotalPreview = calcularSubtotal(precioFinal, cantidadNum, descPct || undefined, descMonto || undefined);

  const handleAgregar = () => {
    if (!varianteId || !articuloId) return;

    onAgregar({
      articuloVarianteId: varianteId,
      cantidad: cantidadNum.toString(),
      precioUnitario: precioFinal.toFixed(2),
      descuentoPorcentaje: descPct || undefined,
      descuentoMonto: descMonto || undefined,
      subtotalLinea: calcularSubtotal(precioFinal, cantidadNum, descPct || undefined, descMonto || undefined),
      articuloVariante: varianteSeleccionada,
    });

    setVarianteId(null);
    setCantidad('1');
    setDescPct('');
    setDescMonto('');
    setPrecioManual('');
  };

  const handleClose = () => {
    setBusqueda('');
    setArticuloId(null);
    setVarianteId(null);
    setCantidad('1');
    setDescPct('');
    setDescMonto('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {articuloId && (
              <button
                type="button"
                onClick={() => { setArticuloId(null); setVarianteId(null); }}
                className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <span>{articuloId ? articuloSeleccionado?.nombre : 'Agregar artículo'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buscador — siempre visible */}
          {!articuloId && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Buscar por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  autoFocus
                />
                {isFetching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {debouncedSearch.length < 2 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                  <Package className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Escribí al menos 2 caracteres para buscar</p>
                </div>
              ) : articulos.length === 0 && !isFetching ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                  <p className="text-sm">Sin resultados para "{debouncedSearch}"</p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden divide-y max-h-56 overflow-y-auto">
                  {articulos.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                      onClick={() => setArticuloId(a.id!)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium group-hover:text-foreground">{a.nombre}</p>
                          {a.codigo && <p className="text-xs text-muted-foreground font-mono">{a.codigo}</p>}
                        </div>
                        {a.precioDefault != null && (
                          <span className="text-sm font-bold tabular-nums shrink-0">
                            ${fmt(a.precioDefault)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Grilla variantes */}
          {articuloId && articuloSeleccionado && (
            <div className="space-y-4">
              {articuloSeleccionado.codigo && (
                <p className="text-xs text-muted-foreground font-mono">{articuloSeleccionado.codigo}</p>
              )}

              {grilla && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    Seleccionar variante
                  </p>
                  <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `auto repeat(${grilla.colores.length}, minmax(0, 1fr))` }}
                  >
                    {/* Color headers */}
                    <div />
                    {grilla.colores.map((c) => (
                      <div key={c.id} className="text-center text-xs text-muted-foreground font-medium truncate px-0.5">
                        {c.codigo}
                      </div>
                    ))}
                    {/* Rows */}
                    {grilla.talles.map((talle) => (
                      <React.Fragment key={talle.id}>
                        <div className="text-xs font-semibold pr-2 flex items-center text-foreground">
                          {talle.codigo}
                        </div>
                        {grilla.colores.map((color) => {
                          const celda = grilla.celdas.find(
                            (c) => c.talleId === talle.id && c.colorId === color.id,
                          );
                          const stock = Number(celda?.cantidad ?? '0');
                          const vid = celda?.varianteId;
                          const selected = vid === varianteId;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              disabled={!vid || stock <= 0}
                              onClick={() => vid && setVarianteId(vid)}
                              className={cn(
                                'rounded-md text-xs py-1.5 text-center transition-all border font-medium',
                                selected
                                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                  : stock > 0
                                    ? 'bg-background hover:bg-muted border-border cursor-pointer'
                                    : 'bg-muted/20 text-muted-foreground/40 border-muted/30 cursor-not-allowed',
                              )}
                            >
                              {stock > 0 ? stock : '·'}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Config línea */}
              {varianteId && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Precio unit.</p>
                      {precioBase > 0 ? (
                        <p className="text-sm font-bold">${fmt(precioBase)}</p>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="h-8 text-sm"
                          value={precioManual}
                          onChange={(e) => setPrecioManual(e.target.value)}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Cantidad</p>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        className="h-8 text-sm"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Subtotal</p>
                      <p className="text-sm font-bold pt-1 tabular-nums">
                        ${fmt(parseFloat(subtotalPreview))}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Descuento %</p>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          className={cn('h-8 text-sm pr-6', descPct && 'border-red-300 bg-red-50')}
                          value={descPct}
                          onChange={(e) => { setDescPct(e.target.value); setDescMonto(''); }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Descuento $</p>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className={cn('h-8 text-sm pr-5', descMonto && 'border-red-300 bg-red-50')}
                          value={descMonto}
                          onChange={(e) => { setDescMonto(e.target.value); setDescPct(''); }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-9" onClick={handleAgregar}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar línea
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
