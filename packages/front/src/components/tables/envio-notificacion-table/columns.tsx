"use client";
import { ColumnDef } from "@tanstack/react-table";
import { EnvioNotificacion } from "@/types";
import { CellColumn } from "@/components/ui/cell-column";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime } from "@/utils/date";
import { hasPermission } from "@/hooks/use-access";
import { PERMISOS } from "@/constants/permisos";
import { Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDeleteEnvioNotificacionMutation } from "@/hooks/envio-notificacion";
import Link from "next/link";

const baseUrl = "/administracion/envios-notificacion";

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "enviado":
      return <Badge variant="success">Enviado</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">Pendiente</Badge>;
  }
};

const DataTableRowActions = ({ data }: { data: EnvioNotificacion }) => {
  const { toast } = useToast();
  const { mutateAsync: deleteEnvio } = useDeleteEnvioNotificacionMutation();
  const canDelete = hasPermission(PERMISOS.ENVIO_NOTIFICACION_ELIMINAR);

  if (!canDelete) return null;

  const handleDelete = async () => {
    if (!data.id || !confirm("¿Eliminar este registro de envío?")) return;
    try {
      await deleteEnvio(data.id);
      toast({ title: "Registro eliminado" });
    } catch {
      toast({ title: "Error al eliminar el registro", variant: "destructive" });
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<EnvioNotificacion>[] = [
  {
    accessorFn: (row) => row.id,
    id: "id",
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn className="text-blue-600 hover:underline">
          #{row.original.id}
        </CellColumn>
      </Link>
    ),
    enableColumnFilter: false,
  },
  {
    accessorFn: (row) => row.plantilla?.nombre,
    id: "plantilla",
    accessorKey: "plantilla.nombre",
    header: "Plantilla",
    cell: ({ row }) => (
      <CellColumn>{row.original.plantilla?.nombre || "-"}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.modeloId,
    id: "modeloId",
    accessorKey: "modeloId",
    header: "Referencia",
    cell: ({ row }) => (
      <CellColumn>Factura #{row.original.modeloId}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.canal,
    id: "canal",
    accessorKey: "canal",
    header: "Canal / Destinatario",
    cell: ({ row }) => {
      const { canal, emailDestinatario } = row.original;
      const isWhatsapp = canal === "whatsapp";
      return (
        <CellColumn>
          <div className="flex items-center gap-2">
            {isWhatsapp ? (
              <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate text-sm">
              {emailDestinatario || (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
        </CellColumn>
      );
    },
  },
  {
    accessorFn: (row) => row.estado,
    id: "estado",
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <CellColumn>{getEstadoBadge(row.original.estado)}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.createdAt,
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => (
      <CellColumn>
        {row.getValue("createdAt")
          ? formatTime(row.getValue("createdAt"))
          : "-"}
      </CellColumn>
    ),
  },
  {
    id: "acciones",
    enableColumnFilter: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
