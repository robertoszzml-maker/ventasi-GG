"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ColumnFiltersState } from "@tanstack/react-table";
import { EnvioNotificacionForm } from "@/components/forms/envio-notificacion-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tipo de entidad: 'factura', 'presupuesto', etc. */
  modelo: string;
  /** Modo individual: ID de la entidad a notificar */
  entidadId?: number;
  /** Nombre del cliente (solo modo individual, para el título) */
  clienteNombre?: string;
  /** Filtros del dashboard (sin entidad específica → notifica a múltiples clientes) */
  columnFilters?: ColumnFiltersState;
};

export function NotificacionDialog({
  open,
  onOpenChange,
  modelo,
  entidadId,
  clienteNombre,
  columnFilters = [],
}: Props) {
  const esMasivo = entidadId === undefined;
  const titulo = esMasivo
    ? "Enviar notificaciones"
    : `Notificar${clienteNombre ? `: ${clienteNombre}` : ""}`;

  const filtrosEnvio: ColumnFiltersState = esMasivo
    ? columnFilters
    : [{ id: "id", value: entidadId }];

  const sinFiltros =
    esMasivo &&
    columnFilters.filter((f) => f.value !== undefined && f.value !== "")
      .length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {esMasivo && (
            <DialogDescription>
              Se enviará una notificación por cliente agrupando todas sus
              entidades.
            </DialogDescription>
          )}
        </DialogHeader>

        {sinFiltros && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Sin filtros activos: se notificará a todos los clientes.
          </p>
        )}

        <EnvioNotificacionForm
          modelo={modelo}
          columnFilters={filtrosEnvio}
          open={open}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
