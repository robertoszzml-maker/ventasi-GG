"use client";

import {
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { useGetEjemplosQuery } from "@/hooks/ejemplos";
import { columns, ExpandedRowComponent } from "./columns";
import { SkeletonTable } from "@/components/skeletons/skeleton-table";
import { Ejemplo } from "@/types";

export function EjemplosTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data = [], isLoading } = useGetEjemplosQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
      expanded,
    },
  });

  if (isLoading) return <SkeletonTable />;

  return (
    <DataTable
      table={table}
      columns={columns}
      renderSubComponent={(row: Ejemplo) => {
        const tableRow = table
          .getRowModel()
          .rows.find((r) => r.original.id === row.id);
        return tableRow ? <ExpandedRowComponent row={tableRow} /> : null;
      }}
    />
  );
}
