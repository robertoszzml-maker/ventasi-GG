'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MovimientoInventario } from '@/types';
import { CellColumn } from '@/components/ui/cell-column';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const TIPO_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  MOVIMIENTO: { label: 'Movimiento', variant: 'default' },
  ARREGLO: { label: 'Arreglo', variant: 'secondary' },
};

const getProcedencia = (m: MovimientoInventario): string => {
  if (m.procedenciaUbicacion) return m.procedenciaUbicacion.nombre;
  if (m.procedenciaProveedor) return m.procedenciaProveedor.nombre;
  if (m.procedenciaCliente) return m.procedenciaCliente.nombre;
  return '—';
};

const getDestino = (m: MovimientoInventario): string => {
  if (m.destinoUbicacion) return m.destinoUbicacion.nombre;
  if (m.destinoProveedor) return m.destinoProveedor.nombre;
  if (m.destinoCliente) return m.destinoCliente.nombre;
  return '—';
};

const baseUrl = '/movimientos';

export const columns: ColumnDef<MovimientoInventario>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <Link href={`${baseUrl}/${row.original.id}`}>
        <CellColumn>#{row.getValue('id')}</CellColumn>
      </Link>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string;
      const config = TIPO_LABELS[tipo] || { label: tipo, variant: 'outline' as const };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ row }) => <CellColumn>{row.getValue('fecha')}</CellColumn>,
  },
  {
    id: 'procedencia',
    header: 'Procedencia',
    cell: ({ row }) => <CellColumn>{getProcedencia(row.original)}</CellColumn>,
  },
  {
    id: 'destino',
    header: 'Destino',
    cell: ({ row }) => <CellColumn>{getDestino(row.original)}</CellColumn>,
  },
  {
    accessorKey: 'cantidadTotal',
    header: 'Total uds',
    cell: ({ row }) => <CellColumn>{row.getValue('cantidadTotal')}</CellColumn>,
  },
  {
    id: 'responsable',
    header: 'Responsable',
    cell: ({ row }) => {
      const r = row.original.responsable;
      return <CellColumn>{r ? (r.nombre || r.email) : '—'}</CellColumn>;
    },
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => (
      <CellColumn className="max-w-[200px] truncate">
        {row.getValue('descripcion') || '—'}
      </CellColumn>
    ),
  },
];
