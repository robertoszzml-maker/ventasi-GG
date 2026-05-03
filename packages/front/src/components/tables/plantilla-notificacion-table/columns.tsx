"use client";
import { ColumnDef } from "@tanstack/react-table";
import { PlantillaNotificacion } from "@/types";
import { CellColumn } from "@/components/ui/cell-column";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { hasPermission } from "@/hooks/use-access";
import { PERMISOS } from "@/constants/permisos";
import { useDeletePlantillaNotificacionMutation } from "@/hooks/plantilla-notificacion";
import { useToast } from "@/hooks/use-toast";

const baseUrl = "/administracion/plantillas";

const DataTableRowActions = ({ data }: { data: PlantillaNotificacion }) => {
  const { toast } = useToast();
  const { mutateAsync: deletePlantilla } =
    useDeletePlantillaNotificacionMutation();
  const canEdit = hasPermission(PERMISOS.PLANTILLA_NOTIFICACION_EDITAR);
  const canDelete = hasPermission(PERMISOS.PLANTILLA_NOTIFICACION_ELIMINAR);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la plantilla "${data.nombre}"?`)) return;
    try {
      await deletePlantilla(data.id!);
      toast({ description: "Plantilla eliminada" });
    } catch {
      toast({ description: "Error al eliminar la plantilla", variant: "destructive" });
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
        {canEdit && (
          <Link href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </Link>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<PlantillaNotificacion>[] = [
  {
    accessorFn: (row) => row.nombre,
    id: "nombre",
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn className="text-blue-600 hover:underline">
          {row.getValue("nombre")}
        </CellColumn>
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.descripcion,
    id: "descripcion",
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <CellColumn>{row.getValue("descripcion") || "-"}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.asunto,
    id: "asunto",
    accessorKey: "asunto",
    header: "Asunto",
    cell: ({ row }) => (
      <CellColumn>{row.getValue("asunto") || "-"}</CellColumn>
    ),
  },
  {
    id: "acciones",
    header: "Acciones",
    enableColumnFilter: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
