"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { flexRender } from "@tanstack/react-table";
import type {
  Table as TableType,
  ColumnDef,
  Column,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { DatePicker } from "@/components/date-picker";
import { useConfigStore } from "@/stores/config-store";
import { DateRangePicker } from "../date-range-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  table: TableType<T>;
  columns: ColumnDef<T>[];
  toolbar?: boolean;
  download?: React.ReactNode;
  create?: boolean;
  deleteFilters?: boolean;
  onDelete?: () => void;
  customActions?: React.ReactNode;
  pagination?: boolean;
  renderSubComponent?: (row: T) => React.ReactElement;
}

export function DataTable<T>({
  table,
  columns,
  toolbar,
  download,
  create = true,
  deleteFilters = true,
  onDelete,
  customActions,
  pagination = true,
  renderSubComponent,
}: DataTableProps<T>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { accessibilityMode } = useConfigStore();

  const handleScroll = (direction: "left" | "right") => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({
        left: direction === "right" ? 500 : -500,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full space-y-3">
      {!toolbar ? (
        <DataTableToolbar
          create={create}
          table={table}
          download={download}
          onDelete={onDelete}
          deleteFilters={deleteFilters}
          customActions={customActions}
        />
      ) : (
        customActions && <div className="flex justify-end">{customActions}</div>
      )}

      <div className="rounded-lg border overflow-hidden shadow-sm">
        <div className="relative w-full overflow-auto" ref={tableContainerRef}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40 border-b">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanSort() ? (
                            <button
                              type="button"
                              onClick={() =>
                                header.column.toggleSorting(
                                  header.column.getIsSorted() === "asc"
                                )
                              }
                              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                              aria-label={`Ordenar por ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.id}`}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5 text-primary" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                              )}
                            </button>
                          ) : (
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                          )}
                          {header.column.getCanFilter() && (
                            <div className="mt-1.5">
                              {header.column.columnDef.meta?.customFilter ? (
                                header.column.columnDef.meta.customFilter(table)
                              ) : (
                                <Filter column={header.column} />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className="transition-colors hover:bg-muted/30 border-b border-border/50 last:border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && renderSubComponent && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={row.getVisibleCells().length} className="px-4 py-3">
                          {renderSubComponent(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <SearchX className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">Sin resultados</p>
                      <p className="text-xs">Intentá ajustar los filtros o la búsqueda</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && <DataTablePagination table={table} />}

      {accessibilityMode && (
        <div className="fixed bottom-14 right-14 flex gap-2 z-50">
          <Button
            size="sm"
            variant="default"
            className="rounded-full shadow-lg"
            onClick={() => handleScroll("left")}
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="rounded-full shadow-lg"
            onClick={() => handleScroll("right")}
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, filterOptions } = column.columnDef.meta ?? {};

  const parsedFilterValue = React.useMemo(() => {
    if (typeof columnFilterValue === 'string' && (columnFilterValue.startsWith('{') || columnFilterValue.startsWith('['))) {
      try {
        return JSON.parse(columnFilterValue);
      } catch {
        return columnFilterValue;
      }
    }
    return columnFilterValue;
  }, [columnFilterValue]);

  const handleFromChange = React.useCallback(
    (value: string | number) => {
      const currentValue = typeof parsedFilterValue === 'object' && parsedFilterValue !== null
        ? parsedFilterValue as { from: string | number; to: string | number }
        : undefined;
      const newFrom = value;
      const currentTo = currentValue?.to ?? "";
      if (newFrom !== "" || currentTo !== "") {
        column.setFilterValue(JSON.stringify({ from: newFrom, to: currentTo }));
      } else {
        column.setFilterValue(undefined);
      }
    },
    [column, parsedFilterValue]
  );

  const handleToChange = React.useCallback(
    (value: string | number) => {
      const currentValue = typeof parsedFilterValue === 'object' && parsedFilterValue !== null
        ? parsedFilterValue as { from: string | number; to: string | number }
        : undefined;
      const newTo = value;
      const currentFrom = currentValue?.from ?? "";
      if (currentFrom !== "" || newTo !== "") {
        column.setFilterValue(JSON.stringify({ from: currentFrom, to: newTo }));
      } else {
        column.setFilterValue(undefined);
      }
    },
    [column, parsedFilterValue]
  );

  return filterVariant === "range" ? (
    <div className="flex gap-1.5">
      <DebouncedInput
        type="number"
        value={(parsedFilterValue as { from: string | number; to: string | number })?.from ?? ""}
        onChange={handleFromChange}
        placeholder="Mín"
        className="w-20"
      />
      <DebouncedInput
        type="number"
        value={(parsedFilterValue as { from: string | number; to: string | number })?.to ?? ""}
        onChange={handleToChange}
        placeholder="Máx"
        className="w-20"
      />
    </div>
  ) : filterVariant === "date" ? (
    <DatePicker
      onChange={(e) => column.setFilterValue(e)}
      defaultValue={columnFilterValue?.toString()}
    />
  ) : filterVariant === "date-range" ? (
    <DateRangePicker
      onChange={(range) => column.setFilterValue(JSON.stringify(range))}
      defaultValue={parsedFilterValue as { from: string; to: string } | null}
    />
  ) : filterVariant === "multi-select" && filterOptions ? (
    <MultiSelect
      options={filterOptions}
      onValueChange={(values) => {
        column.setFilterValue(values.length > 0 ? JSON.stringify(values) : undefined);
      }}
      defaultValue={Array.isArray(parsedFilterValue) ? parsedFilterValue : []}
      placeholder="Seleccionar..."
      maxCount={2}
      className="w-full"
    />
  ) : (
    <DebouncedInput
      className="w-36"
      onChange={(value) => column.setFilterValue(value)}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 1000,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value, debounce]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        const newValue =
          props.type === "number"
            ? e.target.value === "" ? "" : Number(e.target.value)
            : e.target.value;
        setValue(newValue);
      }}
    />
  );
}
