'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CurvaTalle, Talle } from '@/types';
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
import { useDeleteCurvasTalleMutation } from '@/hooks/curvas-talle';

const baseUrl = '/curvas-talle';

const TalleBadges = ({ curva }: { curva: CurvaTalle }) => {
  const talles: Talle[] =
    curva.talles ??
    curva.detalles?.map((d) => d.talle).filter((t): t is Talle => !!t) ??
    [];

  if (talles.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {talles.map((talle, i) => (
        <span
          key={i}
          className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-xs font-medium"
        >
          {talle.codigo}
        </span>
      ))}
    </div>
  );
};

const DataTableRowActions = ({ data }: { data: CurvaTalle }) => {
  const { mutate } = useDeleteCurvasTalleMutation();
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

export const columns: ColumnDef<CurvaTalle>[] = [
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
    id: 'talles',
    header: 'Talles',
    cell: ({ row }) => <TalleBadges curva={row.original} />,
    enableSorting: false,
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
