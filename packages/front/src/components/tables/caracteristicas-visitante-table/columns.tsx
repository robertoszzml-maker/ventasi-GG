'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CaracteristicaVisitante } from '@/types';
import { CellColumn } from '@/components/ui/cell-column';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { IconoCaracteristica } from '@/components/visitas/icono-caracteristica';
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
import { Badge } from '@/components/ui/badge';
import { useDeleteCaracteristicaVisitanteMutation } from '@/hooks/caracteristica-visitante';

const baseUrl = '/visitas/caracteristicas-visitante';

const DataTableRowActions = ({ data }: { data: CaracteristicaVisitante }) => {
  const { mutate } = useDeleteCaracteristicaVisitanteMutation();
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

export const columns: ColumnDef<CaracteristicaVisitante>[] = [
  {
    accessorKey: 'icono',
    header: 'Ícono',
    cell: ({ row }) => (
      <CellColumn>
        <IconoCaracteristica nombre={row.getValue('icono')} className="h-5 w-5" />
      </CellColumn>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>
          <span className="font-medium">{row.getValue('nombre')}</span>
        </CellColumn>
      </Link>
    ),
  },
  {
    accessorKey: 'orden',
    header: 'Orden',
    cell: ({ row }) => <CellColumn>{row.getValue('orden')}</CellColumn>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => (
      <CellColumn>
        <Badge variant={row.getValue('activo') ? 'default' : 'secondary'}>
          {row.getValue('activo') ? 'Activo' : 'Inactivo'}
        </Badge>
      </CellColumn>
    ),
    enableColumnFilter: false,
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
