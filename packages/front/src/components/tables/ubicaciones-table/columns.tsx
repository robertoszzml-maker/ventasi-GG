'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Ubicacion } from '@/types';
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
import { useDeleteUbicacionMutation } from '@/hooks/ubicacion';

const baseUrl = '/ubicaciones';

const DataTableRowActions = ({ data }: { data: Ubicacion }) => {
  const { mutate } = useDeleteUbicacionMutation();
  const [openDelete, setOpenDelete] = React.useState(false);

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
          <Link href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Ubicacion>[] = [
  {
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
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue('nombre')}</CellColumn>
      </Link>
    ),
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => (
      <CellColumn>{row.getValue('descripcion') || '—'}</CellColumn>
    ),
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
