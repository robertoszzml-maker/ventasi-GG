'use client';

import React from 'react';
import { useGetGrillaQuery, useRegistrarIngresoMutation, useAjustarCantidadMutation, useActualizarCodigoBarrasMutation } from '@/hooks/articulo-variantes';
import { useAddTalleArticuloMutation } from '@/hooks/articulos';
import { useGetTallesQuery } from '@/hooks/talles';
import { CeldaGrilla, GrillaColor, Talle, IngresoItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { SkeletonTable } from '@/components/skeletons/skeleton-table';

interface GrillaVariantesProps {
  articuloId: number;
}

const ColorSwatches = ({ codigos }: { codigos: string[] }) => {
  if (codigos.length === 0) {
    return (
      <div
        className="w-5 h-5 rounded-full border shadow-sm flex-shrink-0 mx-auto"
        style={{ background: 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)' }}
      />
    );
  }
  if (codigos.length === 1) {
    return (
      <div
        className="w-5 h-5 rounded-full border shadow-sm flex-shrink-0 mx-auto"
        style={{ backgroundColor: codigos[0] }}
      />
    );
  }
  return (
    <div className="flex -space-x-1 justify-center">
      {codigos.slice(0, 3).map((hex, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full border shadow-sm flex-shrink-0"
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  );
};

const StockBadge = ({ cantidad }: { cantidad?: string }) => {
  if (!cantidad) return null;
  const n = Number(cantidad);
  if (n === 0) return <Badge variant="destructive" className="text-xs">Sin stock</Badge>;
  if (n <= 5) return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400">{cantidad}</Badge>;
  return <Badge variant="default" className="text-xs bg-green-600">{cantidad}</Badge>;
};

export function GrillaVariantes({ articuloId }: GrillaVariantesProps) {
  const { toast } = useToast();
  const { data: grilla, isLoading } = useGetGrillaQuery(articuloId);
  const { mutateAsync: ajustar, isPending: isAjustando } = useAjustarCantidadMutation();
  const { mutateAsync: registrarIngreso, isPending: isRegistrando } = useRegistrarIngresoMutation();
  const { mutateAsync: addTalle, isPending: isAddingTalle } = useAddTalleArticuloMutation();

  const { data: todosLosTalles = [] } = useGetTallesQuery({
    pagination: { pageIndex: 0, pageSize: 200 },
    sorting: [{ id: 'orden', desc: false }],
  });

  // Estado para diálogo de ajuste individual
  const [celdaSeleccionada, setCeldaSeleccionada] = React.useState<CeldaGrilla | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = React.useState('');
  const [nuevoCodigoBarras, setNuevoCodigoBarras] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { mutateAsync: actualizarCodigo } = useActualizarCodigoBarrasMutation();

  // Estado para sheet de ingreso masivo
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [cantidadesIngreso, setCantidadesIngreso] = React.useState<Record<string, string>>({});

  // Estado para agregar talle
  const [agregarTalleOpen, setAgregarTalleOpen] = React.useState(false);
  const [talleSeleccionado, setTalleSeleccionado] = React.useState<number | undefined>();

  if (isLoading) return <SkeletonTable />;
  if (!grilla) return <p className="text-muted-foreground">Sin datos de grilla.</p>;

  const { talles, colores, celdas, stockTotal } = grilla;

  const getCelda = (talleId: number, colorId: number): CeldaGrilla | undefined =>
    celdas.find((c) => c.talleId === talleId && c.colorId === colorId);

  const getStockColumna = (colorId: number): number =>
    celdas
      .filter((c) => c.colorId === colorId && c.cantidad)
      .reduce((sum, c) => sum + Number(c.cantidad ?? 0), 0);

  const handleClickCelda = (celda: CeldaGrilla | undefined, talleId: number, colorId: number) => {
    const t = talles.find((t) => t.id === talleId);
    const c = colores.find((c) => c.id === colorId);
    if (!t || !c) return;

    const celdaEfectiva: CeldaGrilla = celda ?? {
      talleId,
      talleCodigo: t.codigo,
      talleNombre: t.nombre,
      talleOrden: t.orden,
      colorId,
      colorCodigo: c.codigo,
      colorNombre: c.nombre,
      colorCodigos: c.codigos,
      colorOrden: 0,
      estado: 'potencial',
    };
    setCeldaSeleccionada(celdaEfectiva);
    setNuevaCantidad(celda?.cantidad ?? '0');
    setNuevoCodigoBarras('');
    setDialogOpen(true);
  };

  const handleGuardarAjuste = async () => {
    if (!celdaSeleccionada) return;
    try {
      if (celdaSeleccionada.varianteId) {
        await ajustar({
          articuloId,
          varianteId: celdaSeleccionada.varianteId,
          cantidad: nuevaCantidad,
        });
        if (nuevoCodigoBarras.trim() !== '') {
          await actualizarCodigo({
            articuloId,
            varianteId: celdaSeleccionada.varianteId,
            codigoBarras: nuevoCodigoBarras.trim() || null,
          });
        }
      } else {
        // Potencial: registrar como primer ingreso
        await registrarIngreso({
          articuloId,
          items: [{ talleId: celdaSeleccionada.talleId, colorId: celdaSeleccionada.colorId, cantidad: nuevaCantidad }],
        });
      }
      toast({ title: 'Stock actualizado' });
      setDialogOpen(false);
    } catch {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    }
  };

  const handleIngresoMasivo = async () => {
    const items: IngresoItem[] = Object.entries(cantidadesIngreso)
      .filter(([, v]) => v !== '' && Number(v) > 0)
      .map(([key, cantidad]) => {
        const [talleId, colorId] = key.split('-').map(Number);
        return { talleId, colorId, cantidad };
      });

    if (items.length === 0) {
      toast({ title: 'No hay cantidades ingresadas', variant: 'destructive' });
      return;
    }

    try {
      await registrarIngreso({ articuloId, items });
      toast({ title: `Ingreso registrado: ${items.length} variantes` });
      setSheetOpen(false);
      setCantidadesIngreso({});
    } catch {
      toast({ title: 'Error al registrar ingreso', variant: 'destructive' });
    }
  };

  const handleAgregarTalle = async () => {
    if (!talleSeleccionado) return;
    try {
      await addTalle({ id: articuloId, talleId: talleSeleccionado });
      toast({ title: 'Talle agregado' });
      setAgregarTalleOpen(false);
      setTalleSeleccionado(undefined);
    } catch {
      toast({ title: 'Error al agregar talle', variant: 'destructive' });
    }
  };

  const tallesEnArticulo = new Set(talles.map((t) => t.id));
  const tallesDisponibles = todosLosTalles.filter((t) => !tallesEnArticulo.has(t.id));

  const getCeldaBackgroundClass = (celda: CeldaGrilla | undefined): string => {
    if (!celda) return 'bg-gray-50 hover:bg-gray-100';
    if (celda.estado === 'potencial') return 'bg-gray-50 hover:bg-gray-100';
    if (celda.estado === 'real-extra') return 'bg-blue-50 hover:bg-blue-100 border-l-2 border-l-blue-400';
    return 'bg-white hover:bg-gray-50';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-base font-semibold">
            Stock total: {stockTotal}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAgregarTalleOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar talle
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setCantidadesIngreso({});
              setSheetOpen(true);
            }}
          >
            Registrar ingreso masivo
          </Button>
        </div>
      </div>

      {/* Grilla */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-muted font-medium text-left sticky left-0 z-10 min-w-16">
                Talle
              </th>
              {colores.map((color: GrillaColor) => (
                <th
                  key={color.id}
                  className="border p-2 bg-muted font-medium text-center min-w-20"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ColorSwatches codigos={color.codigos} />
                    <span className="text-xs">{color.codigo}</span>
                  </div>
                </th>
              ))}
              <th className="border p-2 bg-muted font-medium text-center min-w-16">Total</th>
            </tr>
          </thead>
          <tbody>
            {talles.map((talle) => {
              const totalFila = celdas
                .filter((c) => c.talleId === talle.id && c.cantidad)
                .reduce((sum, c) => sum + Number(c.cantidad ?? 0), 0);

              return (
                <tr key={talle.id}>
                  <td className="border p-2 font-medium bg-muted/30 sticky left-0">
                    <span className="font-mono">{talle.codigo}</span>
                  </td>
                  {colores.map((color) => {
                    const celda = getCelda(talle.id!, color.id!);
                    return (
                      <td
                        key={color.id}
                        className={`border p-2 text-center cursor-pointer transition-colors ${getCeldaBackgroundClass(celda)}`}
                        onClick={() => handleClickCelda(celda, talle.id!, color.id!)}
                      >
                        {celda?.estado === 'potencial' || !celda ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex justify-center">
                            <StockBadge cantidad={celda.cantidad} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="border p-2 text-center font-medium bg-muted/20">
                    {totalFila > 0 ? (
                      <Badge variant="secondary">{totalFila}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="border p-2 font-bold bg-muted sticky left-0">Total</td>
              {colores.map((color) => {
                const total = getStockColumna(color.id!);
                return (
                  <td key={color.id} className="border p-2 text-center font-medium bg-muted/50">
                    {total > 0 ? (
                      <Badge variant="secondary">{total}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                );
              })}
              <td className="border p-2 text-center font-bold bg-muted">
                <Badge>{stockTotal}</Badge>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-50 border" />
          <span>Sin stock registrado (potencial)</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="destructive" className="text-xs">0</Badge>
          <span>Sin stock</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400">1-5</Badge>
          <span>Stock bajo</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge className="text-xs bg-green-600">6+</Badge>
          <span>Stock OK</span>
        </div>
      </div>

      {/* Diálogo ajuste individual */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {celdaSeleccionada?.estado === 'potencial'
                ? 'Registrar primer ingreso'
                : 'Ajustar stock'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Talle:</span>{' '}
              {celdaSeleccionada?.talleCodigo} — {celdaSeleccionada?.talleNombre}
            </p>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="font-medium text-foreground">Color:</span>{' '}
              <ColorSwatches codigos={celdaSeleccionada?.colorCodigos ?? []} />
              <span>{celdaSeleccionada?.colorCodigo} — {celdaSeleccionada?.colorNombre}</span>
            </div>
            {celdaSeleccionada?.cantidad && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Cantidad actual:</span>{' '}
                {celdaSeleccionada.cantidad}
              </p>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">Nueva cantidad</label>
              <Input
                type="number"
                min="0"
                value={nuevaCantidad}
                onChange={(e) => setNuevaCantidad(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            {celdaSeleccionada?.varianteId && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Código de barras</label>
                <Input
                  type="text"
                  value={nuevoCodigoBarras}
                  onChange={(e) => setNuevoCodigoBarras(e.target.value)}
                  placeholder="Dejá vacío para auto-generar"
                />
                <p className="text-xs text-muted-foreground">
                  Si está vacío, el sistema genera uno automáticamente
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarAjuste}
              disabled={isAjustando || isRegistrando}
            >
              {isAjustando || isRegistrando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet ingreso masivo */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Registrar ingreso masivo</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingrese las cantidades para cada variante. Deje en blanco las que no aplican.
            </p>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted font-medium text-left">Talle</th>
                    {colores.map((color: GrillaColor) => (
                      <th key={color.id} className="border p-2 bg-muted text-center min-w-24">
                        <div className="flex flex-col items-center gap-1">
                          <ColorSwatches codigos={color.codigos} />
                          <span className="text-xs">{color.codigo}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {talles.map((talle) => (
                    <tr key={talle.id}>
                      <td className="border p-2 font-medium bg-muted/30">
                        <span className="font-mono">{talle.codigo}</span>
                      </td>
                      {colores.map((color) => {
                        const key = `${talle.id}-${color.id}`;
                        return (
                          <td key={color.id} className="border p-1">
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="h-8 text-center text-sm"
                              value={cantidadesIngreso[key] ?? ''}
                              onChange={(e) =>
                                setCantidadesIngreso((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleIngresoMasivo} disabled={isRegistrando}>
                {isRegistrando ? 'Registrando...' : 'Registrar ingreso'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo agregar talle */}
      <Dialog open={agregarTalleOpen} onOpenChange={setAgregarTalleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar talle al artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {tallesDisponibles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay talles disponibles para agregar.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {tallesDisponibles.map((talle: Talle) => (
                  <button
                    key={talle.id}
                    type="button"
                    onClick={() => setTalleSeleccionado(talle.id)}
                    className={`p-2 rounded border text-sm font-mono font-medium transition-colors ${
                      talleSeleccionado === talle.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    {talle.codigo}
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgregarTalleOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarTalle}
              disabled={!talleSeleccionado || isAddingTalle}
            >
              {isAddingTalle ? 'Agregando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
