'use client'
import { DataTable } from "@/components/ui/data-table"
import { useGetUsuariosQuery } from "@/hooks/usuario"
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from 'react'
import { columns } from './columns'
import { SkeletonTable } from "@/components/skeletons/skeleton-table"

export function UsuariosTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState(""); // Estado del filtro
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    id: true,
    email: true,
    nombre: true,
    active: true,
    permisoId: true,
    telefono: true,
    telefonoOtro: true,
    attemps: true,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const { data = [], isLoading } = useGetUsuariosQuery({ pagination, columnFilters, sorting, globalFilter })
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter
    },
  })

  if (isLoading) return <SkeletonTable />


  return (
    <>
      <DataTable table={table} columns={columns} />
    </>
  )
}

