'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Color, CurvaColor } from '@/types';
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
import { useDeleteCurvasColorMutation } from '@/hooks/curvas-color';

const baseUrl = '/curvas-color';

const ColorSwatch = ({ hex }: { hex?: string }) => {
  const style = hex
    ? { backgroundColor: hex }
    : { background: 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)' };
  return <div className="w-5 h-5 rounded-full border shadow-sm flex-shrink-0" style={style} />;
};

const ColorBadges = ({ curva }: { curva: CurvaColor }) => {
  const colores: Color[] =
    curva.colores ??
    curva.detalles?.map((d) => d.color).filter((c): c is Color => !!c) ??
    [];

  if (colores.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {colores.map((color, i) => {
        const codigos = color.codigos ?? [];
        const hexPrimario = codigos[0]?.hex;
        return (
          <div key={i} className="flex items-center gap-1 bg-muted rounded-full pl-1 pr-2 py-0.5">
            {codigos.length > 1 ? (
              <div className="flex -space-x-1">
                {codigos.slice(0, 2).map((c, j) => (
                  <ColorSwatch key={j} hex={c?.hex} />
                ))}
              </div>
            ) : (
              <ColorSwatch hex={hexPrimario} />
            )}
            <span className="text-xs font-medium">{color.nombre}</span>
          </div>
        );
      })}
    </div>
  );
};

const DataTableRowActions = ({ data }: { data: CurvaColor }) => {
  const { mutate } = useDeleteCurvasColorMutation();
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

export const columns: ColumnDef<CurvaColor>[] = [
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
    id: 'colores',
    header: 'Colores',
    cell: ({ row }) => <ColorBadges curva={row.original} />,
    enableSorting: false,
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
