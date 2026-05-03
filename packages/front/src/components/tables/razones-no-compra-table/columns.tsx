'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { RazonNoCompra } from '@/types';
import { CellColumn } from '@/components/ui/cell-column';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const baseUrl = '/visitas/razones-no-compra';

const DataTableRowActions = ({ data }: { data: RazonNoCompra }) => {
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
        <Link href={`${baseUrl}/${data.id}`}>
          <DropdownMenuItem>Editar / Sub-razones</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<RazonNoCompra>[] = [
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
    id: 'subRazones',
    header: 'Sub-razones',
    cell: ({ row }) => (
      <CellColumn>
        <span className="text-sm text-muted-foreground">
          {row.original.subRazones?.length ?? 0} configuradas
        </span>
      </CellColumn>
    ),
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
