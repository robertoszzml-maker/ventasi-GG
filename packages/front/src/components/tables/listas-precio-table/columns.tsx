'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ListaPrecio } from '@/types';
import { CellColumn } from '@/components/ui/cell-column';
import { Badge } from '@/components/ui/badge';
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
import { useDeleteListaPrecioMutation, useEditListaPrecioMutation } from '@/hooks/lista-precio';
import { useToast } from '@/hooks/use-toast';

const baseUrl = '/listas-de-precios';

const DataTableRowActions = ({ data }: { data: ListaPrecio }) => {
  const { mutate: eliminar } = useDeleteListaPrecioMutation();
  const { mutate: editar } = useEditListaPrecioMutation();
  const { toast } = useToast();
  const [openDelete, setOpenDelete] = React.useState(false);

  const marcarDefault = () => {
    editar(
      { id: data.id!, data: { esDefault: 1 } },
      { onSuccess: () => toast({ title: 'Lista marcada como predeterminada' }) },
    );
  };

  return (
    <>
      <DeleteDialog
        onDelete={() => {
          eliminar(data.id!);
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
            <DropdownMenuItem>Ver precios</DropdownMenuItem>
          </Link>
          {data.esDefault !== 1 && (
            <DropdownMenuItem onClick={marcarDefault}>
              Marcar como predeterminada
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {data.esDefault !== 1 && (
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<ListaPrecio>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>
          <span>{row.getValue('nombre')}</span>
          {row.original.esDefault === 1 && (
            <Badge variant="secondary" className="ml-2 text-xs">Predeterminada</Badge>
          )}
        </CellColumn>
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
