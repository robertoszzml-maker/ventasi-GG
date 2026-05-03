"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Articulo, DetalleMovimiento } from "@/types";
import { useGetGrillaQuery } from "@/hooks/articulo-variantes";
import { GrillaVariantesMovimiento } from "./grilla-variantes-movimiento";
import { Combobox } from "@/components/ui/combobox";

interface ArticuloMovimientoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articulosDisponibles?: Articulo[];
  /** Si se pasa, el artículo ya está fijado (modo edición) */
  articuloFijo?: Articulo;
  detallesIniciales: DetalleMovimiento[];
  onConfirmar: (articulo: Articulo, detalles: DetalleMovimiento[]) => void;
  modoArreglo?: boolean;
  stockActual?: Record<number, string>;
}

export function ArticuloMovimientoDialog({
  open,
  onOpenChange,
  articulosDisponibles = [],
  articuloFijo,
  detallesIniciales,
  onConfirmar,
  modoArreglo = false,
  stockActual = {},
}: ArticuloMovimientoDialogProps) {
  const [articuloSeleccionadoId, setArticuloSeleccionadoId] = React.useState<string>(
    articuloFijo ? String(articuloFijo.id) : ""
  );
  const [detalles, setDetalles] = React.useState<DetalleMovimiento[]>(detallesIniciales);
  // Key para remontar la grilla limpiamente cada vez que abre el dialog
  const [grillaKey, setGrillaKey] = React.useState(0);

  // Reset al abrir
  React.useEffect(() => {
    if (open) {
      setArticuloSeleccionadoId(articuloFijo ? String(articuloFijo.id) : "");
      setDetalles(detallesIniciales);
      setGrillaKey((k) => k + 1);
    }
  }, [open]);

  const articuloActual: Articulo | undefined =
    articuloFijo ??
    articulosDisponibles.find((a) => String(a.id) === articuloSeleccionadoId);

  const { data: grilla, isLoading: cargandoGrilla } = useGetGrillaQuery(
    articuloActual?.id ?? 0
  );

  const subtotal = detalles.reduce((sum, d) => sum + (parseInt(d.cantidad) || 0), 0);

  const handleConfirmar = () => {
    if (!articuloActual) return;
    onConfirmar(articuloActual, detalles);
    onOpenChange(false);
  };

  const todosDisponibles = articuloFijo
    ? [articuloFijo, ...articulosDisponibles]
    : articulosDisponibles;

  const opcionesArticulos = todosDisponibles.map((a) => ({
    value: String(a.id),
    label: a.nombre + (a.sku ? ` (${a.sku})` : ""),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>
            {articuloFijo ? `Editar cantidades — ${articuloFijo.nombre}` : "Agregar artículo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Selector de artículo (solo en modo agregar) */}
          {!articuloFijo && (
            <div>
              <Label className="text-sm mb-1 block">Artículo</Label>
              <Combobox
                options={opcionesArticulos}
                value={articuloSeleccionadoId}
                onChange={(v) => {
                  setArticuloSeleccionadoId(v);
                  setDetalles([]);
                }}
                placeholder="Seleccionar artículo..."
                searchPlaceholder="Buscar por nombre o SKU..."
                emptyText="No se encontró el artículo."
              />
            </div>
          )}

          {/* Grilla */}
          {articuloActual && (
            <div>
              {cargandoGrilla ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Cargando variantes...</p>
              ) : grilla && (grilla.talles.length === 0 || grilla.colores.length === 0) ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Este artículo no tiene talles o colores configurados.
                </p>
              ) : grilla ? (
                <div className="border border-border rounded-lg p-4">
                  <GrillaVariantesMovimiento
                    key={grillaKey}
                    articuloId={articuloActual.id!}
                    grilla={grilla}
                    detalles={detalles}
                    onChange={setDetalles}
                    modoArreglo={modoArreglo}
                    stockActual={stockActual}
                  />
                </div>
              ) : null}
            </div>
          )}

          {!articuloActual && (
            <div className="border border-dashed border-border rounded-lg py-10 text-center text-sm text-muted-foreground">
              Seleccioná un artículo para ver sus combinaciones de talle y color.
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {subtotal > 0 ? (
              <>Subtotal: <strong>{subtotal}</strong> unidades</>
            ) : (
              "Sin cantidades ingresadas"
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirmar} disabled={!articuloActual}>
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
