'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Color } from '@/types';
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
import { useDeleteColoresMutation } from '@/hooks/colores';

const baseUrl = '/colores';

const ColorSwatchHex = ({ hex }: { hex: string }) => (
  <div
    className="w-6 h-6 rounded-full border shadow-sm flex-shrink-0"
    style={{ backgroundColor: hex }}
    title={hex}
  />
);

const ColorSwatches = ({ color }: { color: Color }) => {
  const codigos = color.codigos ?? [];
  if (codigos.length === 0) {
    return (
      <div
        className="w-6 h-6 rounded-full border shadow-sm flex-shrink-0"
        style={{ background: 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)' }}
        title="Sin códigos"
      />
    );
  }
  return (
    <div className="flex -space-x-1">
      {codigos.slice(0, 4).map((c, i) => (
        <ColorSwatchHex key={i} hex={c.hex} />
      ))}
    </div>
  );
};

const DataTableRowActions = ({ data }: { data: Color }) => {
  const { mutate } = useDeleteColoresMutation();
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

export const columns: ColumnDef<Color>[] = [
  {
    id: 'swatch',
    header: '',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ColorSwatches color={row.original} />
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'codigo',
    header: 'Código',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>{row.getValue('codigo')}</CellColumn>
      </Link>
    ),
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
