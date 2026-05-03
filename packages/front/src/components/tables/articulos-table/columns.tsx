'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Articulo } from '@/types';
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
import { useDeleteArticulosMutation } from '@/hooks/articulos';

const baseUrl = '/articulos';

const formatMoney = (valor: number): string =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(valor);

const DataTableRowActions = ({ data }: { data: Articulo }) => {
  const { mutate } = useDeleteArticulosMutation();
  const [openDelete, setOpenDelete] = React.useState(false);

  return (
    <>
      <DeleteDialog
        onDelete={() => { mutate(data.id!); setOpenDelete(false); }}
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
            <DropdownMenuItem>Ver / Editar</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const getColumns = (puedeVerCosto: boolean): ColumnDef<Articulo>[] => [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn className="font-medium">{row.getValue('nombre')}</CellColumn>
      </Link>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <CellColumn><span className="font-mono text-sm">{row.getValue('sku')}</span></CellColumn>
    ),
  },
  {
    id: 'precioDefault',
    header: 'Precio venta',
    cell: ({ row }) => {
      const precio = row.original.precioDefault;
      return <CellColumn>{precio != null ? formatMoney(precio) : '—'}</CellColumn>;
    },
    enableColumnFilter: false,
  },
  ...(puedeVerCosto ? [{
    id: 'costo',
    header: 'Costo',
    cell: ({ row }: { row: { original: Articulo } }) => {
      const costo = row.original.costo;
      return (
        <CellColumn>
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            {costo != null ? formatMoney(costo) : '—'}
          </span>
        </CellColumn>
      );
    },
    enableColumnFilter: false,
  } as ColumnDef<Articulo>] : []),
  {
    id: 'subgrupo',
    header: 'Subgrupo',
    cell: ({ row }) => <CellColumn>{row.original.subgrupo?.nombre || '—'}</CellColumn>,
  },
  {
    id: 'variantes',
    header: 'Variantes',
    cell: ({ row }) => {
      const total = row.original.totalVariantes ?? 0;
      return <Badge variant={total > 0 ? 'default' : 'secondary'}>{total}</Badge>;
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.original.stockTotal;
      if (!stock) return <Badge variant="secondary">0</Badge>;
      const stockNum = Number(stock);
      return <Badge variant={stockNum === 0 ? 'destructive' : stockNum <= 5 ? 'outline' : 'default'}>{stock}</Badge>;
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
