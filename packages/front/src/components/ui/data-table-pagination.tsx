import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<T> {
  table: Table<T>;
  hidePageSizeSelector?: boolean;
}

export function DataTablePagination<T>({
  table,
  hidePageSizeSelector = false,
}: DataTablePaginationProps<T>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
      <p className="text-xs text-muted-foreground shrink-0">
        {selectedCount > 0 ? (
          <span>
            <span className="font-medium text-foreground">{selectedCount}</span> de{" "}
            <span className="font-medium text-foreground">{totalCount}</span> fila(s) seleccionada(s)
          </span>
        ) : (
          <span>
            <span className="font-medium text-foreground">{totalCount}</span> resultado(s)
          </span>
        )}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
        {!hidePageSizeSelector && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">Filas por página</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs text-muted-foreground px-2 tabular-nums whitespace-nowrap">
            {totalPages > 0 ? (
              <>
                <span className="font-medium text-foreground">{currentPage}</span>
                {" / "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </>
            ) : (
              "—"
            )}
          </span>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
