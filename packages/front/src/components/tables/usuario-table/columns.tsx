import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteUsuario } from '@/hooks/usuario'
import { Usuario } from '@/types'
import {
  ColumnDef,
  Table as TableType
} from "@tanstack/react-table"
import { MoreHorizontal } from 'lucide-react'
import Link from "next/link"
import { DeleteDialog } from "@/components/ui/delete-dialog"
const baseUrl = 'usuarios'
const DataTableRowActions = ({ data }: { data: Usuario }) => {
  const { mutate } = useDeleteUsuario();
  const [openDelete, setOpenDelete] = React.useState(false)

  return (

    <>
      <DeleteDialog
        onDelete={() => {
          mutate(data.id);
          setOpenDelete(false)
        }}
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
        }}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild >
          <Button variant="ghost" className="h-8 w-8 p-0" >
            <span className="sr-only" > Abrir menú </span>
            < MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        < DropdownMenuContent align="end" >
          <DropdownMenuLabel>Acciones </DropdownMenuLabel>
          <Link href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem >
              Ver
            </DropdownMenuItem>
          </Link>

          <Link href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem >
              Editar
            </DropdownMenuItem>
          </Link>
          < DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>

  );
};

export const columns: ColumnDef<Usuario>[] = [
  {
    accessorKey: "id",
    header: "ID",
    meta: '',
    cell: ({ row }) => <Link className="pl-4" href={`${baseUrl}/${row.getValue("id")}`}> {row.getValue("id")} </Link>,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <Link className="pl-4" href={`${baseUrl}/${row.getValue("id")}`}> {row.getValue("nombre")} </Link>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div> {row.getValue("email")} </div>,
  },
  {
    accessorKey: "active",
    header: "Activo",
    cell: ({ row }) => <div> {row.getValue("active") ? 'Activo' : 'Inactivo'} </div>,
  },
  {
    accessorKey: "permiso",
    header: "Permiso",
    cell: ({ row }) => <div> {row.getValue("permiso")} </div>,
  },
  {
    accessorKey: "telefono",
    header: "Telefono",
    cell: ({ row }) => <div> {row.getValue("telefono")} </div>,
  }, {
    accessorKey: "telefonoOtro",
    header: "Telefono otro",
    cell: ({ row }) => <div> {row.getValue("telefonoOtro")} </div>,
  },
  {
    accessorKey: "attemps",
    header: "Intentos",
    cell: ({ row }) => <div> {row.getValue("attemps")} </div>,
  },
  {
    id: "acciones",
    cell: ({ row }) => {
      return <DataTableRowActions data={row.original} />;
    },
  }
]