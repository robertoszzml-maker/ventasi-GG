'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Minus, Plus, AlertTriangle, Tag, MousePointer2 } from 'lucide-react';
import { useGetMovimientoInventarioByIdQuery } from '@/hooks/movimiento-inventario';
import { useGetVariantesParaEtiquetasQuery } from '@/hooks/etiquetas';
import { useEtiquetaConfig } from '@/hooks/etiqueta-config';
import { EtiquetaPreview } from '@/components/etiqueta/etiqueta-preview';
import { codificarDatosEtiqueta, ItemEtiqueta } from '@/lib/etiqueta';
import { VarianteEtiqueta } from '@/types';

const LIMITE_ADVERTENCIA = 500;
const MM_TO_PX = 3.7795;
const PREVIEW_CONTAINER_W = 256; // px — ancho fijo del panel de preview

function escalaParaAncho(anchoMm: number): number {
  const escalaIdeal = PREVIEW_CONTAINER_W / (anchoMm * MM_TO_PX);
  return Math.min(escalaIdeal, 3); // nunca más grande que 3×
}

function SkeletonRow() {
  return (
    <tr className="border-t animate-pulse">
      <td className="px-3 py-3"><div className="h-4 w-4 bg-muted rounded" /></td>
      <td className="px-3 py-3"><div className="h-4 w-16 bg-muted rounded" /></td>
      <td className="px-3 py-3"><div className="h-4 w-20 bg-muted rounded" /></td>
      <td className="px-3 py-3"><div className="h-8 w-28 bg-muted rounded ml-auto" /></td>
    </tr>
  );
}

function CantidadControl({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Reducir"
        className="h-8 w-8 rounded-md border bg-background flex items-center justify-center hover:bg-muted transition-colors cursor-pointer select-none"
        onClick={() => onChange(Math.max(0, valor - 1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={0}
        value={valor}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="h-8 w-12 rounded-md border bg-background text-center text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Aumentar"
        className="h-8 w-8 rounded-md border bg-background flex items-center justify-center hover:bg-muted transition-colors cursor-pointer select-none"
        onClick={() => onChange(valor + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function PrepararContent() {
  const searchParams = useSearchParams();
  const movimientoId = searchParams.get('movimientoId');
  const articuloIdsParam = searchParams.get('articuloIds');

  const articuloIds = React.useMemo(
    () => (articuloIdsParam ? articuloIdsParam.split(',').map(Number).filter(Boolean) : []),
    [articuloIdsParam],
  );

  const { data: movimiento, isLoading: cargandoMovimiento } = useGetMovimientoInventarioByIdQuery(
    movimientoId ? Number(movimientoId) : 0,
  );
  const { data: variantesApi = [], isLoading: cargandoVariantes } = useGetVariantesParaEtiquetasQuery(
    articuloIds.length > 0 ? articuloIds : [],
  );

  const cargando = movimientoId ? cargandoMovimiento : cargandoVariantes;
  const { config } = useEtiquetaConfig();

  const [cantidades, setCantidades] = React.useState<Record<number, number>>({});
  const [seleccionadas, setSeleccionadas] = React.useState<Set<number>>(new Set());
  const [varianteActiva, setVarianteActiva] = React.useState<VarianteEtiqueta | null>(null);
  const [inicializado, setInicializado] = React.useState(false);

  const variantes: VarianteEtiqueta[] = React.useMemo(() => {
    if (movimientoId && movimiento?.detalles) {
      return movimiento.detalles
        .filter((d: any) => d.articuloVariante)
        .map((d: any) => ({
          articuloId: d.articuloVariante.articuloId,
          articuloNombre: d.articuloVariante.articulo?.nombre ?? '—',
          varianteId: d.articuloVariante.id,
          talleNombre: d.articuloVariante.talle?.nombre ?? '—',
          colorNombre: d.articuloVariante.color?.nombre ?? '—',
          codigoBarras: d.articuloVariante.codigoBarras ?? null,
        }));
    }
    return variantesApi;
  }, [movimientoId, movimiento, variantesApi]);

  React.useEffect(() => {
    if (inicializado || variantes.length === 0) return;
    const init: Record<number, number> = {};
    if (movimientoId && movimiento?.detalles) {
      movimiento.detalles
        .filter((d: any) => d.articuloVariante)
        .forEach((d: any) => {
          init[d.articuloVariante.id] = Math.max(0, parseInt(d.cantidad ?? '0', 10));
        });
    } else {
      variantes.forEach((v) => { init[v.varianteId] = 1; });
    }
    setCantidades(init);
    setSeleccionadas(new Set(variantes.map((v) => v.varianteId)));
    setVarianteActiva(variantes[0] ?? null);
    setInicializado(true);
  }, [variantes, movimientoId, movimiento, inicializado]);

  const setCantidad = (varianteId: number, valor: number) => {
    setCantidades((prev) => ({ ...prev, [varianteId]: Math.max(0, valor) }));
  };

  const toggleVariante = (varianteId: number) => {
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      next.has(varianteId) ? next.delete(varianteId) : next.add(varianteId);
      return next;
    });
  };

  const toggleGrupo = (ids: number[]) => {
    const todosOn = ids.every((id) => seleccionadas.has(id));
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      todosOn ? ids.forEach((id) => next.delete(id)) : ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const itemsParaImprimir = React.useMemo(
    () =>
      variantes.filter(
        (v) => seleccionadas.has(v.varianteId) && (cantidades[v.varianteId] ?? 0) > 0,
      ),
    [variantes, seleccionadas, cantidades],
  );

  const totalEtiquetas = itemsParaImprimir.reduce((s, v) => s + (cantidades[v.varianteId] ?? 0), 0);

  const imprimir = () => {
    const items: ItemEtiqueta[] = itemsParaImprimir.map((v) => ({
      variante: v,
      cantidad: cantidades[v.varianteId] ?? 0,
    }));
    if (!items.length) return;
    window.open(`/print/etiquetas?data=${codificarDatosEtiqueta({ items, config })}`, '_blank');
  };

  const porArticulo = React.useMemo(() => {
    const mapa = new Map<number, { nombre: string; variantes: VarianteEtiqueta[] }>();
    variantes.forEach((v) => {
      if (!mapa.has(v.articuloId)) mapa.set(v.articuloId, { nombre: v.articuloNombre, variantes: [] });
      mapa.get(v.articuloId)!.variantes.push(v);
    });
    return Array.from(mapa.values());
  }, [variantes]);

  const subtotalGrupo = (vs: VarianteEtiqueta[]) =>
    vs.filter((v) => seleccionadas.has(v.varianteId)).reduce((s, v) => s + (cantidades[v.varianteId] ?? 0), 0);

  const origen = movimientoId
    ? `Movimiento #${movimientoId}`
    : `${articuloIds.length} artículo${articuloIds.length !== 1 ? 's' : ''} seleccionado${articuloIds.length !== 1 ? 's' : ''}`;

  const escala = escalaParaAncho(config.ancho_mm);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <PageTitle title="Preparar etiquetas" />
          <p className="text-sm text-muted-foreground mt-0.5">Origen: {origen}</p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          {totalEtiquetas > LIMITE_ADVERTENCIA && (
            <div className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{totalEtiquetas} etiquetas — puede demorar</span>
            </div>
          )}
          <Button disabled={totalEtiquetas === 0} onClick={imprimir} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
            {totalEtiquetas > 0 && (
              <Badge variant="secondary" className="tabular-nums">{totalEtiquetas}</Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
        {/* Panel izquierdo */}
        <div className="space-y-3 min-w-0">
          {cargando ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 animate-pulse"><div className="h-4 w-32 bg-muted rounded" /></div>
              <table className="w-full text-sm"><tbody>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
            </div>
          ) : porArticulo.length === 0 ? (
            <div className="border border-dashed rounded-lg py-16 text-center">
              <Tag className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Sin variantes para mostrar</p>
            </div>
          ) : (
            porArticulo.map((grupo) => {
              const ids = grupo.variantes.map((v) => v.varianteId);
              const todosOn = ids.every((id) => seleccionadas.has(id));
              const algunoOn = ids.some((id) => seleccionadas.has(id));
              const subtotal = subtotalGrupo(grupo.variantes);
              return (
                <div key={grupo.nombre} className="border rounded-lg overflow-hidden shadow-sm">
                  {/* Cabecera del grupo */}
                  <div className="bg-muted/40 px-3 py-2.5 flex items-center gap-3 border-b">
                    <Checkbox
                      checked={todosOn}
                      data-indeterminate={!todosOn && algunoOn}
                      onCheckedChange={() => toggleGrupo(ids)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Seleccionar todas las variantes de ${grupo.nombre}`}
                      className="cursor-pointer"
                    />
                    <span className="font-semibold text-sm flex-1 truncate">{grupo.nombre}</span>
                    {subtotal > 0 && (
                      <Badge variant="secondary" className="tabular-nums text-xs shrink-0">{subtotal}</Badge>
                    )}
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="w-10 px-3 py-2" />
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Talle</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.variantes.map((v) => {
                        const activa = varianteActiva?.varianteId === v.varianteId;
                        const checked = seleccionadas.has(v.varianteId);
                        const cantidad = cantidades[v.varianteId] ?? 0;
                        return (
                          <tr
                            key={v.varianteId}
                            className={`border-t cursor-pointer transition-colors duration-150 border-l-2 ${
                              activa
                                ? 'bg-primary/8 border-l-primary'
                                : checked
                                ? 'hover:bg-muted/30 border-l-transparent'
                                : 'opacity-50 hover:opacity-70 border-l-transparent'
                            }`}
                            onMouseEnter={() => setVarianteActiva(v)}
                            onClick={() => setVarianteActiva(v)}
                          >
                            <td className="px-3 py-2.5">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleVariante(v.varianteId)}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`font-mono text-sm ${activa ? 'font-semibold' : ''}`}>
                                {v.talleNombre}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">{v.colorNombre}</td>
                            <td className="px-3 py-2.5">
                              <CantidadControl
                                valor={cantidad}
                                onChange={(val) => setCantidad(v.varianteId, val)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>

        {/* Panel derecho: preview */}
        <div className="lg:sticky lg:top-4 w-full lg:w-72 space-y-3 self-start">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vista previa</p>

          {varianteActiva ? (
            <div className="border rounded-xl p-4 space-y-3 shadow-sm bg-card">
              {/* Contenedor con ancho fijo para el preview — evita overflow */}
              <div style={{ width: `${PREVIEW_CONTAINER_W}px`, overflow: 'hidden' }}>
                <EtiquetaPreview variante={varianteActiva} config={config} escala={escala} />
              </div>
              <div className="space-y-1 pt-1 border-t">
                <p className="text-xs font-medium truncate">{varianteActiva.articuloNombre}</p>
                <p className="text-xs text-muted-foreground">
                  T: <span className="font-mono">{varianteActiva.talleNombre}</span>
                  {' · '}C: {varianteActiva.colorNombre}
                </p>
                {seleccionadas.has(varianteActiva.varianteId) ? (
                  <p className="text-xs text-muted-foreground">
                    Cant:{' '}
                    <span className="font-semibold tabular-nums text-foreground">
                      {cantidades[varianteActiva.varianteId] ?? 0}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">No incluida en la impresión</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-xl p-8 text-center space-y-2">
              <MousePointer2 className="h-6 w-6 mx-auto text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Pasá el cursor sobre una variante</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground/70">
            {config.ancho_mm}×{config.alto_mm}mm ·{' '}
            {config.modo === 'web-serial' ? 'ZPL directo' : 'Sistema'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EtiquetasPrepararPage() {
  return (
    <React.Suspense fallback={
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-3">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
          <div className="h-64 bg-muted rounded-xl w-72" />
        </div>
      </div>
    }>
      <PrepararContent />
    </React.Suspense>
  );
}
