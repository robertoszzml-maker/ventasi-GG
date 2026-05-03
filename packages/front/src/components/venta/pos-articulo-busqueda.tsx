'use client';

import React from 'react';
import { Search, ArrowLeft, Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { buscarArticulos, fetchGrillaConPrecio, buscarVariantePorBarcode } from '@/services/articulo-venta';
import { VentaDetalle, ArticuloVariante } from '@/types';
import { cn } from '@/lib/utils';

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PosArticuloBusquedaProps {
  listaPrecioId?: number;
  onAgregar: (detalle: Omit<VentaDetalle, 'id' | 'ventaId'>) => void;
}

export function PosArticuloBusqueda({ listaPrecioId, onAgregar }: PosArticuloBusquedaProps) {
  const [busqueda, setBusqueda] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [articuloId, setArticuloId] = React.useState<number | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [noEncontrado, setNoEncontrado] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Refs para acceder al estado actual desde el listener global (evita closures obsoletos)
  const busquedaRef = React.useRef(busqueda);
  React.useEffect(() => { busquedaRef.current = busqueda; }, [busqueda]);
  const listaPrecioIdRef = React.useRef(listaPrecioId);
  React.useEffect(() => { listaPrecioIdRef.current = listaPrecioId; }, [listaPrecioId]);
  const articulosRef = React.useRef<typeof articulos>([]);
  const executarScanRef = React.useRef<((barcode: string) => void) | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(busqueda), 280);
    return () => clearTimeout(t);
  }, [busqueda]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [articuloId]);

  const { data: articulos = [], isFetching } = useQuery({
    queryKey: ['articulos-pos', debouncedSearch, listaPrecioId],
    queryFn: () => buscarArticulos(debouncedSearch, listaPrecioId),
    enabled: debouncedSearch.length >= 2,
  });
  articulosRef.current = articulos;

  const { data: grilla, isFetching: isFetchingGrilla } = useQuery({
    queryKey: ['grilla-pos', articuloId, listaPrecioId],
    queryFn: () => fetchGrillaConPrecio(articuloId!, listaPrecioId),
    enabled: !!articuloId,
  });

  const articuloSeleccionado = articulos.find((a) => a.id === articuloId);

  const agregarVariante = (varianteId: number, talleId: number, colorId: number, talleCodigo: string, colorCodigo: string) => {
    if (!articuloSeleccionado) return;
    const precio = articuloSeleccionado.precioDefault ?? 0;
    const variante: ArticuloVariante = {
      id: varianteId,
      articuloId: articuloId!,
      talleId,
      colorId,
      cantidad: '0',
      talle: { id: talleId, codigo: talleCodigo, nombre: talleCodigo, orden: 0 },
      color: { id: colorId, codigo: colorCodigo, nombre: colorCodigo },
      articulo: { id: articuloSeleccionado.id, nombre: articuloSeleccionado.nombre, sku: articuloSeleccionado.sku },
    };

    onAgregar({
      articuloVarianteId: varianteId,
      cantidad: '1',
      precioUnitario: precio.toFixed(2),
      subtotalLinea: precio.toFixed(2),
      articuloVariante: variante,
    });

    setArticuloId(null);
    setBusqueda('');
    setDebouncedSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const executarScan = async (barcode: string) => {
    if (!barcode) return;
    setIsScanning(true);
    setNoEncontrado(false);
    try {
      const result = await buscarVariantePorBarcode(barcode, listaPrecioIdRef.current);
      const precio = result.precio ?? 0;
      onAgregar({
        articuloVarianteId: result.varianteId,
        cantidad: '1',
        precioUnitario: precio.toFixed(2),
        subtotalLinea: precio.toFixed(2),
        articuloVariante: {
          id: result.varianteId,
          articuloId: result.articuloId,
          talleId: result.talleId,
          colorId: result.colorId,
          cantidad: '0',
          talle: { id: result.talleId, codigo: result.talleCodigo, nombre: result.talleCodigo, orden: 0 },
          color: { id: result.colorId, codigo: result.colorCodigo, nombre: result.colorCodigo },
          articulo: { id: result.articuloId, nombre: result.articuloNombre, sku: result.articuloSku },
        },
      });
      setBusqueda('');
      setDebouncedSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      const arts = articulosRef.current;
      if (arts.length === 1) {
        setArticuloId(arts[0].id!);
      } else {
        setNoEncontrado(true);
        setTimeout(() => setNoEncontrado(false), 1200);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Actualiza el ref en cada render para que el listener global use la versión más reciente
  executarScanRef.current = executarScan;

  // Intercepta Enter en fase de captura (antes que el browser o cualquier elemento de la página)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const esOtroInput = (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
        && target !== inputRef.current;
      if (esOtroInput) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const barcode = busquedaRef.current.trim();
        if (barcode) executarScanRef.current?.(barcode);
        return;
      }

      // Si el scanner dispara mientras el foco está en otro lado, redirigir al input
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && target !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, []);

  const seleccionarArticulo = async (id: number) => {
    const articulo = articulos.find((a) => a.id === id);
    if (!articulo) return;
    setArticuloId(id);
  };

  React.useEffect(() => {
    if (!articuloId || !grilla) return;
    const esUnicaVariante =
      grilla.celdas.length === 1 ||
      (grilla.talles.length <= 1 && grilla.colores.length <= 1 && grilla.celdas.length === 1);
    if (esUnicaVariante) {
      const celda = grilla.celdas[0];
      if (celda?.varianteId) {
        agregarVariante(celda.varianteId, celda.talleId, celda.colorId, celda.talleCodigo, celda.colorCodigo);
      }
    }
  }, [grilla, articuloId]);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Search input - siempre visible */}
      <div className="p-3 border-b bg-muted/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {!articuloId ? (
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar artículo por nombre o código..."
              className={cn(
                'w-full h-10 pl-9 pr-4 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-offset-1 transition-all',
                noEncontrado
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-ring',
              )}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 pl-9 h-10">
              <button
                type="button"
                onClick={() => { setArticuloId(null); setBusqueda(''); setDebouncedSearch(''); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold truncate">{articuloSeleccionado?.nombre}</span>
              {articuloSeleccionado?.precioDefault != null && (
                <span className="text-sm font-bold text-primary ml-auto shrink-0">
                  ${fmt(articuloSeleccionado.precioDefault)}
                </span>
              )}
            </div>
          )}
          {(isFetching || isFetchingGrilla || isScanning) && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {!articuloId && (
        <div className="min-h-[120px]">
          {debouncedSearch.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Package className="h-8 w-8 opacity-20" />
              <p className="text-sm">Escribí para buscar un artículo</p>
            </div>
          ) : articulos.length === 0 && !isFetching ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-muted-foreground">Sin resultados para "{debouncedSearch}"</p>
            </div>
          ) : (
            <div className="divide-y">
              {articulos.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors group flex items-center justify-between gap-3"
                  onClick={() => seleccionarArticulo(a.id!)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.nombre}</p>
                    {a.codigo && <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.codigo}</p>}
                  </div>
                  {a.precioDefault != null && (
                    <span className="text-sm font-bold tabular-nums shrink-0 text-foreground">
                      ${fmt(a.precioDefault)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grilla de variantes inline */}
      {articuloId && grilla && grilla.celdas.length > 1 && (
        <div className="p-4">
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `5rem repeat(${grilla.colores.length}, minmax(0, 1fr))` }}
          >
            {/* Headers de colores */}
            <div />
            {grilla.colores.map((c) => (
              <div key={c.id} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                {c.codigo}
              </div>
            ))}

            {/* Filas de talles */}
            {grilla.talles.map((talle) => (
              <React.Fragment key={talle.id}>
                <div className="flex items-center text-sm font-bold text-foreground pr-2">
                  {talle.codigo}
                </div>
                {grilla.colores.map((color) => {
                  const celda = grilla.celdas.find(
                    (c) => c.talleId === talle.id && c.colorId === color.id,
                  );
                  const stock = Number(celda?.cantidad ?? '0');
                  const vid = celda?.varianteId;
                  const disponible = !!vid && stock > 0;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      disabled={!disponible}
                      onClick={() => vid && agregarVariante(vid, talle.id ?? 0, color.id ?? 0, talle.codigo, color.codigo)}
                      className={cn(
                        'rounded-lg text-sm py-2.5 font-semibold text-center transition-all border',
                        disponible
                          ? 'bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary border-border cursor-pointer'
                          : 'bg-muted/20 text-muted-foreground/30 border-muted/30 cursor-not-allowed',
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

      {articuloId && isFetchingGrilla && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
