import { Table } from "@tanstack/react-table";
import { FilterX, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  download?: React.ReactNode;
  create: boolean;
  deleteFilters: boolean;
  onDelete?: () => void;
  customActions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  download,
  create,
  deleteFilters,
  onDelete,
  customActions,
}: DataTableToolbarProps<TData>) {
  const activeFilters = table.getState().columnFilters.length;
  const isFiltered = activeFilters > 0;
  const pathname = usePathname();
  const selectedRows = table.getSelectedRowModel().rows;
  const showDeleteButton = selectedRows.length > 0;

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        {isFiltered && deleteFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <FilterX className="h-4 w-4" />
            <span className="hidden sm:inline">Limpiar búsqueda</span>
            <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-xs font-medium">
              {activeFilters}
            </Badge>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {customActions}

        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={!showDeleteButton}
            className="h-8 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Eliminar</span>
            {showDeleteButton && (
              <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-xs bg-destructive-foreground/20 text-destructive-foreground">
                {selectedRows.length}
              </Badge>
            )}
          </Button>
        )}

        {download}

        {create && (
          <Link href={`${pathname}/crear`}>
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </Link>
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
