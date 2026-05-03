"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Search, Menu, Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface GenericGridProps<T> {
  /** Hook que recibe: { pagination, sorting, columnFilters, globalFilter, id } */
  useQuery: (params: {
    pagination: PaginationState;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
    id: string | number | null;
  }) => { data: T[] | undefined; isLoading: boolean };

  /** Dibuja cada card en el sidebar */
  renderCard: (item: T) => React.ReactNode;

  /** Dibuja el contenido del item seleccionado */
  renderContent: (item: T) => React.ReactNode;

  /** Qué campo se usa para filtrar */
  filterField?: string;

  /** Extractor de ID */
  getId: (item: T) => string | number;

  /** Campos ordenables */
  sortableFields?: { id: string; label: string }[];

  /** Sorting por defecto */
  defaultSorting?: SortingState;

  /** Callback para crear un nuevo elemento */
  onCreate?: () => void;
}

export function GenericGrid<T>({
  useQuery,
  renderCard,
  renderContent,
  filterField,
  getId,
  sortableFields = [],
  defaultSorting = [],
  onCreate,
}: GenericGridProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialId = searchParams.get("id");

  const [selected, setSelected] = React.useState<T | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    filterField ? [] : []
  );
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounce del filtro
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (filterField) {
        setColumnFilters((prev) => {
          const others = prev.filter((f) => f.id !== filterField);
          return inputValue
            ? [...others, { id: filterField, value: inputValue }]
            : others;
        });
        setPagination((p) => ({ ...p, pageIndex: 0 }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, filterField]);

  const { data = [], isLoading } = useQuery({
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    id: selected ? getId(selected) : initialId,
  });

  // Precargar el item inicial si hay un ID en la URL
  React.useEffect(() => {
    if (initialId && !selected && data.length > 0) {
      const initialItem = data.find(
        (item) => String(getId(item)) === String(initialId)
      );
      if (initialItem) {
        setSelected(initialItem);
      }
    }
  }, [initialId, selected, data, getId]);

  const handleSelectItem = (item: T) => {
    const id = getId(item);
    setSelected(item);
    setIsSidebarOpen(false);

    const params = new URLSearchParams(window.location.search);
    params.set("id", String(id));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const SidebarContent = React.useMemo(
    () => (
      <div className="w-full h-full flex flex-col bg-muted/10">
        {/* BARRA SUPERIOR */}
        <div className="p-3 space-y-3 border-b">
          {/* FILTRO Y BOTÓN NUEVO */}
          <div className="flex items-center gap-2">
            {filterField && (
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar por ${filterField}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}
            {onCreate && (
              <Button onClick={onCreate} size="sm" className="shrink-0">
                <Plus />
              </Button>
            )}
          </div>
          {/* SORTING */}
          {sortableFields.length > 0 && (
            <div className="flex items-center gap-3">
              {/* SELECT DE COLUMNA */}
              <Select
                onValueChange={(value) => {
                  setSorting([{ id: value, desc: false }]);
                }}
                value={sorting[0]?.id || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por…" />
                </SelectTrigger>

                <SelectContent>
                  {sortableFields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* BOTONES ↑ ↓ */}
              <div className="flex items-center gap-1">
                {/* ASC */}
                <button
                  onClick={() => {
                    if (!sorting[0]?.id) return;
                    setSorting([{ id: sorting[0].id, desc: false }]);
                  }}
                  disabled={sorting[0]?.desc === false}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded border transition-colors",
                    sorting[0]?.desc === false
                      ? "bg-primary text-primary-foreground opacity-80"
                      : "hover:bg-muted"
                  )}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* DESC */}
                <button
                  onClick={() => {
                    if (!sorting[0]?.id) return;
                    setSorting([{ id: sorting[0].id, desc: true }]);
                  }}
                  disabled={sorting[0]?.desc === true}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded border transition-colors",
                    sorting[0]?.desc === true
                      ? "bg-primary text-primary-foreground opacity-80"
                      : "hover:bg-muted"
                  )}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE CARDS */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2 space-y-2">
            {isLoading && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Cargando...
              </div>
            )}

            {!isLoading && data.length === 0 && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                No hay datos
              </div>
            )}

            {!isLoading &&
              data.map((item) => (
                <div
                  key={getId(item)}
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    "cursor-pointer rounded-lg border transition-colors",
                    "hover:bg-accent/50",
                    selected &&
                      getId(selected) === getId(item) &&
                      "bg-accent border-primary"
                  )}
                >
                  {renderCard(item)}
                </div>
              ))}
          </div>
        </ScrollArea>

        {/* PAGINACIÓN FIJA ABAJO */}
        <div className="p-3 border-t bg-background flex items-center justify-between shrink-0">
          <button
            disabled={pagination.pageIndex === 0}
            onClick={() =>
              setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
            }
            className="text-sm px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-accent transition-colors"
          >
            ← Anterior
          </button>

          <span className="text-xs font-medium">
            Página {pagination.pageIndex + 1}
          </span>

          <button
            disabled={data.length < pagination.pageSize}
            onClick={() =>
              setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
            }
            className="text-sm px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-accent transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>
    ),
    [
      filterField,
      inputValue,
      sortableFields,
      sorting,
      isLoading,
      data,
      selected,
      pagination,
      getId,
      onCreate,
    ]
  );

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* HEADER MÓVIL */}
      <div className="lg:hidden p-2 border-b flex items-center justify-between bg-background">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <VisuallyHidden>
              <SheetTitle>Navegación</SheetTitle>
            </VisuallyHidden>
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:flex w-80 flex-col border-r">
        {SidebarContent}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-6 py-2">{renderContent(selected)}</div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Seleccioná un elemento
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Elegí un elemento de la lista para ver sus detalles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
