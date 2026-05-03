'use client';

import React from 'react';
import Link from 'next/link';
import { Articulo } from '@/types';
import { useGetGrillaQuery, useActualizarCodigoBarrasMutation } from '@/hooks/articulo-variantes';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingButton } from '@/components/ui/loading-button';
import { EtiquetaPreview } from '@/components/etiqueta/etiqueta-preview';
import { useEtiquetaConfig } from '@/hooks/etiqueta-config';
import { generarCodigoBarras, codificarDatosEtiqueta } from '@/lib/etiqueta';
import { Save, Eye, Printer } from 'lucide-react';

interface GrillaCodigosBarrasProps {
  articulo: Articulo;
}

export function GrillaCodigosBarras({ articulo }: GrillaCodigosBarrasProps) {
  const { data: grilla } = useGetGrillaQuery(articulo.id!);
  const { mutateAsync: guardar, isPending } = useActualizarCodigoBarrasMutation();
  const { toast } = useToast();
  const { config } = useEtiquetaConfig();

  const [valores, setValores] = React.useState<Record<number, string>>({});
  const [baseline, setBaseline] = React.useState<Record<number, string>>({});
  const [guardando, setGuardando] = React.useState<Record<number, boolean>>({});

  const celdas = (grilla?.celdas ?? []).filter((c) => c.estado === 'real' && c.varianteId);

  React.useEffect(() => {
    if (!celdas.length) return;
    const init: Record<number, string> = {};
    celdas.forEach((c) => { init[c.varianteId!] = c.codigoBarras ?? ''; });
    setValores(init);
    setBaseline(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grilla]);

  const cambiarValor = (varianteId: number, valor: string) => {
    setValores((prev) => ({ ...prev, [varianteId]: valor }));
  };

  const guardarCodigo = async (varianteId: number) => {
    const actual = valores[varianteId] ?? '';
    const original = baseline[varianteId] ?? '';
    if (actual === original) return;
    setGuardando((prev) => ({ ...prev, [varianteId]: true }));
    try {
      await guardar({
        articuloId: articulo.id!,
        varianteId,
        codigoBarras: actual.trim() || null,
      });
      setBaseline((prev) => ({ ...prev, [varianteId]: actual }));
      toast({ title: 'Código de barras guardado' });
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
      setValores((prev) => ({ ...prev, [varianteId]: original }));
    } finally {
      setGuardando((prev) => ({ ...prev, [varianteId]: false }));
    }
  };

  if (!celdas.length) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        No hay variantes con stock registrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Ingresá el código del proveedor por variante. Si lo dejás vacío, el sistema genera uno automáticamente.
        </p>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={`/etiquetas/preparar?articuloIds=${articulo.id}`}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir todas
          </Link>
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Talle</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-56">Código de barras</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Auto-generado</th>
              <th className="px-4 py-2.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {celdas.map((celda) => {
              const varianteId = celda.varianteId!;
              const valor = valores[varianteId] ?? '';
              const original = baseline[varianteId] ?? '';
              const modificado = valor !== original;
              const variante = {
                articuloId: articulo.id!,
                articuloNombre: articulo.nombre,
                varianteId,
                talleNombre: celda.talleNombre,
                colorNombre: celda.colorNombre,
                codigoBarras: valor.trim() || null,
              };
              const codigoAuto = generarCodigoBarras({ ...variante, codigoBarras: null });
              const usandoPropio = valor.trim() !== '';

              return (
                <tr key={varianteId} className="border-t align-middle">
                  <td className="px-4 py-2.5 font-mono text-sm">{celda.talleCodigo}</td>
                  <td className="px-4 py-2.5">{celda.colorNombre}</td>
                  <td className="px-4 py-2.5">
                    <Input
                      value={valor}
                      onChange={(e) => cambiarValor(varianteId, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && guardarCodigo(varianteId)}
                      placeholder="Código del proveedor"
                      className="h-8 text-sm font-mono"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    {usandoPropio ? (
                      <Badge variant="secondary" className="text-xs font-mono">{valor}</Badge>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">{codigoAuto}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {/* Vista previa */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label="Ver preview de etiqueta"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="left" align="center" className="w-auto p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {celda.talleNombre} · {celda.colorNombre}
                          </p>
                          <EtiquetaPreview variante={variante} config={config} escala={2.5} />
                          <p className="text-xs text-muted-foreground/70 font-mono">
                            {usandoPropio ? valor : codigoAuto}
                          </p>
                        </PopoverContent>
                      </Popover>

                      {/* Imprimir 1 etiqueta */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label="Imprimir etiqueta"
                        onClick={() => {
                          const encoded = codificarDatosEtiqueta({
                            items: [{ variante, cantidad: 1 }],
                            config,
                          });
                          window.open(`/print/etiquetas?data=${encoded}`, '_blank');
                        }}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>

                      {/* Guardar — activo solo si hay cambios */}
                      <LoadingButton
                        size="icon"
                        variant={modificado ? 'default' : 'ghost'}
                        className="h-8 w-8 cursor-pointer"
                        disabled={!modificado}
                        loading={guardando[varianteId] ?? false}
                        onClick={() => guardarCodigo(varianteId)}
                        aria-label="Guardar código de barras"
                      >
                        <Save className="h-4 w-4" />
                      </LoadingButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
