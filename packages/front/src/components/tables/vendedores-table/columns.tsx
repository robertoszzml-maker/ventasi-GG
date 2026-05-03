"use client"
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Vendedor } from '@/types'
import { CellColumn } from '@/components/ui/cell-column'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { useDeleteVendedorMutation } from '@/hooks/vendedor'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const baseUrl = '/config/vendedores'

const DataTableRowActions = ({ data }: { data: Vendedor }) => {
    const router = useRouter()
    const { mutate: eliminar } = useDeleteVendedorMutation()
    const { toast } = useToast()
    const [openDelete, setOpenDelete] = React.useState(false)

    return (
        <>
            <DeleteDialog
                onDelete={() => {
                    eliminar(data.id!, {
                        onSuccess: () => toast({ description: 'Vendedor eliminado' }),
                        onError: () => toast({ description: 'No se puede eliminar este vendedor', variant: 'destructive' }),
                    })
                    setOpenDelete(false)
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
                    <DropdownMenuItem onClick={() => router.push(`${baseUrl}/${data.id}`)}>
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export const columns: ColumnDef<Vendedor>[] = [
    {
        accessorFn: (row) => row.codigo,
        id: 'codigo',
        accessorKey: 'codigo',
        header: 'Código',
        cell: ({ row }) => (
            <Link href={`${baseUrl}/${row.original.id}`}>
                <CellColumn className="font-mono">{row.getValue('codigo')}</CellColumn>
            </Link>
        ),
        enableColumnFilter: false,
    },
    {
        accessorFn: (row) => `${row.nombre} ${row.apellido}`,
        id: 'nombre',
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => (
            <Link href={`${baseUrl}/${row.original.id}`}>
                <CellColumn>{row.original.nombre} {row.original.apellido}</CellColumn>
            </Link>
        ),
    },
    {
        accessorFn: (row) => row.dni,
        id: 'dni',
        accessorKey: 'dni',
        header: 'DNI',
        cell: ({ row }) => (
            <CellColumn>{row.getValue('dni') || '—'}</CellColumn>
        ),
    },
    {
        accessorFn: (row) => row.activo,
        id: 'activo',
        accessorKey: 'activo',
        header: 'Estado',
        cell: ({ row }) => (
            <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                row.original.activo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200',
            )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', row.original.activo ? 'bg-emerald-500' : 'bg-gray-400')} />
                {row.original.activo ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
    {
        id: 'acciones',
        enableHiding: false,
        cell: ({ row }) => <DataTableRowActions data={row.original} />,
    },
]
