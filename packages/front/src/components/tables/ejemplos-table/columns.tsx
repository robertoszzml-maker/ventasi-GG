'use client';

import React from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Ejemplo } from '@/types';
import { CellColumn } from '@/components/ui/cell-column';
import { MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { useDeleteEjemploMutation } from '@/hooks/ejemplos';
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';

const baseUrl = '/ejemplos';

const DataTableRowActions = ({ data }: { data: Ejemplo }) => {
  const { mutate } = useDeleteEjemploMutation();
  const [openDelete, setOpenDelete] = React.useState(false);
  const canEdit = hasPermission(PERMISOS.EJEMPLO_EDITAR);
  const canDelete = hasPermission(PERMISOS.EJEMPLO_ELIMINAR);

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

// Componente de fila expandida
export const ExpandedRowComponent = ({ row }: { row: Row<Ejemplo> }) => {
  const ejemplo = row.original;
  return (
    <div className="flex gap-6 p-4 bg-muted/30 rounded-md">
      {ejemplo.imagen?.url && (
        <div className="flex-shrink-0">
          <Image
            src={ejemplo.imagen.url}
            alt={ejemplo.nombre}
            width={80}
            height={80}
            className="rounded-md object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Descripción: </span>
          <span>{ejemplo.descripcion || '—'}</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Fecha: </span>
          <span>{ejemplo.fecha || '—'}</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Categoría: </span>
          <span>{ejemplo.ejemploCategoria?.nombre || '—'}</span>
        </div>
      </div>
    </div>
  );
};

export const columns: ColumnDef<Ejemplo>[] = [
  {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => row.toggleExpanded()}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
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
    accessorFn: (row) => row.ejemploCategoria?.nombre,
    id: 'ejemploCategoria',
    accessorKey: 'ejemploCategoria',
    header: 'Categoría',
    cell: ({ row }) => (
      <CellColumn>{row.original.ejemploCategoria?.nombre || '—'}</CellColumn>
    ),
  },
  {
    accessorFn: (row) => row.fecha,
    id: 'fecha',
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ row }) => <CellColumn>{row.getValue('fecha') || '—'}</CellColumn>,
  },
  {
    accessorFn: (row) => row.estado,
    id: 'estado',
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string;
      return (
        <Badge variant={estado === 'activo' ? 'default' : 'secondary'}>
          {estado}
        </Badge>
      );
    },
  },
  {
    id: 'acciones',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions data={row.original} />,
  },
];
