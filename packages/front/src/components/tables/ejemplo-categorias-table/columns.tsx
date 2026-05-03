'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { EjemploCategoria } from '@/types';
import { CellColumn } from '@/components/ui/cell-column';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { useDeleteEjemploCategoriaMutation } from '@/hooks/ejemplo-categorias';
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';

const baseUrl = '/ejemplo-categorias';

const DataTableRowActions = ({ data }: { data: EjemploCategoria }) => {
  const { mutate } = useDeleteEjemploCategoriaMutation();
  const [openDelete, setOpenDelete] = React.useState(false);
  const canEdit = hasPermission(PERMISOS.EJEMPLO_CATEGORIA_EDITAR);
  const canDelete = hasPermission(PERMISOS.EJEMPLO_CATEGORIA_ELIMINAR);

  return (
    <>
      <DeleteDialog
        onDelete={() => {
          mutate(data.id!);
          setOpenDelete(false);
        }}
        open={openDelete}
        onClose={() => setOpenDelete(false)}
      />
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
              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<EjemploCategoria>[] = [
  {
    accessorFn: (row) => row.id,
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue('id')}</CellColumn>
      </Link>
    ),
    enableColumnFilter: false,
  },
  {
    accessorFn: (row) => row.nombre,
    id: 'nombre',
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue('nombre')}</CellColumn>
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.descripcion,
    id: 'descripcion',
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => <CellColumn>{row.getValue('descripcion')}</CellColumn>,
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
