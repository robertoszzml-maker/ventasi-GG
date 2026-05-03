'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetArticulosQuery } from '@/hooks/articulos';
import { Printer, Search, Tag } from 'lucide-react';
import { Articulo } from '@/types';

const PAGINACION = { pagination: { pageIndex: 0, pageSize: 200 } };

function SkeletonRow() {
  return (
    <tr className="border-t animate-pulse">
      <td className="w-10 px-4 py-3"><div className="h-4 w-4 bg-muted rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-44 bg-muted rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 bg-muted rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 bg-muted rounded" /></td>
    </tr>
  );
}

export default function EtiquetasNuevaPage() {
  const router = useRouter();
  const [busqueda, setBusqueda] = React.useState('');
  const [seleccionados, setSeleccionados] = React.useState<Set<number>>(new Set());

  const { data: articulos = [], isLoading } = useGetArticulosQuery(PAGINACION as any);

  const articulosFiltrados = React.useMemo(() => {
    if (!busqueda.trim()) return articulos;
    const q = busqueda.toLowerCase();
    return articulos.filter(
      (a: Articulo) =>
        a.nombre?.toLowerCase().includes(q) ||
        a.codigo?.toLowerCase().includes(q) ||
        a.sku?.toLowerCase().includes(q),
    );
  }, [articulos, busqueda]);

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const todosSeleccionados =
    articulosFiltrados.length > 0 && seleccionados.size === articulosFiltrados.length;

  const algunoSeleccionado =
    seleccionados.size > 0 &&
    seleccionados.size < articulosFiltrados.length;

  const toggleTodos = () => {
    if (seleccionados.size === articulosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(articulosFiltrados.map((a: Articulo) => a.id!)));
    }
  };

  const prepararEtiquetas = () => {
    const ids = Array.from(seleccionados).join(',');
    router.push(`/etiquetas/preparar?articuloIds=${ids}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <PageTitle title="Imprimir etiquetas" />
        <Button
          disabled={seleccionados.size === 0}
          onClick={prepararEtiquetas}
          className="gap-2 shrink-0"
        >
          <Printer className="h-4 w-4" />
          Preparar etiquetas
          {seleccionados.size > 0 && (
            <Badge variant="secondary" className="tabular-nums">{seleccionados.size}</Badge>
          )}
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre, código o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoFocus
        />
      </div>

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <Checkbox
                  checked={todosSeleccionados}
                  ref={(el) => {
                    if (el) (el as any).indeterminate = algunoSeleccionado;
                  }}
                  onCheckedChange={toggleTodos}
                  aria-label="Seleccionar todos"
                  className="cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Artículo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : articulosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="py-16 text-center">
                    <Tag className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {busqueda ? 'Sin resultados para tu búsqueda' : 'No hay artículos disponibles'}
                    </p>
                    {busqueda && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Probá con otro nombre, código o SKU
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              articulosFiltrados.map((articulo: Articulo) => {
                const seleccionado = seleccionados.has(articulo.id!);
                return (
                  <tr
                    key={articulo.id}
                    onClick={() => toggleSeleccion(articulo.id!)}
                    className={`border-t cursor-pointer transition-colors duration-150 border-l-2 ${
                      seleccionado
                        ? 'bg-primary/5 border-l-primary hover:bg-primary/8'
                        : 'border-l-transparent hover:bg-muted/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={seleccionado}
                        onCheckedChange={() => toggleSeleccion(articulo.id!)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className={`px-4 py-3 ${seleccionado ? 'font-semibold' : 'font-medium'}`}>
                      {articulo.nombre}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{articulo.codigo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{articulo.sku}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer con contador */}
        {!isLoading && articulosFiltrados.length > 0 && (
          <div className="border-t bg-muted/20 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{articulosFiltrados.length} artículo{articulosFiltrados.length !== 1 ? 's' : ''}</span>
            {seleccionados.size > 0 && (
              <span className="font-medium text-foreground">
                {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
