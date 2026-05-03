"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

export interface AutocompleteSelectorConfig<T> {
  // Query hook
  useQuery: (params: any) => {
    data?: T[];
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
  };

  // Configuración de búsqueda
  searchField: string; // Campo por el que se busca (ej: "nombre", "razonSocial")
  sortField?: string; // Campo por el que se ordena (por defecto usa searchField)

  // Funciones de renderizado
  getDisplayValue: (item: T | undefined) => string;
  getItemKey: (item: T) => string | number;
  renderItem?: (item: T) => React.ReactNode; // Opcional para renderizado personalizado

  // Configuración
  placeholder?: string;
  pageSize?: number;
  debounceMs?: number;
}

interface SearchResultsProps<T> {
  query: string;
  selectedResult?: T;
  onSelectResult: (item: T) => void;
  config: AutocompleteSelectorConfig<T>;
}

function SearchResults<T>({
  query,
  selectedResult,
  onSelectResult,
  config,
}: SearchResultsProps<T>) {
  const [debouncedSearchQuery] = useDebounce(query, config.debounceMs ?? 500);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [allItems, setAllItems] = React.useState<T[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const pageSize = config.pageSize ?? 20;

  const { data, isLoading, isError, isFetching } = config.useQuery({
    pagination: { pageIndex, pageSize },
    columnFilters: debouncedSearchQuery
      ? [{ id: config.searchField, value: debouncedSearchQuery }]
      : [],
    globalFilter: "",
    sorting: [{ id: config.sortField ?? config.searchField, desc: false }],
  });

  // Acumular items cuando lleguen nuevos datos
  React.useEffect(() => {
    if (data && pageIndex === 0) {
      setAllItems(data);
      setHasMore(data.length >= pageSize);
    } else if (data && pageIndex > 0) {
      setAllItems((prev) => [...prev, ...data]);
      setHasMore(data.length >= pageSize);
    }
  }, [data, pageIndex, pageSize]);

  // Resetear cuando cambia la búsqueda
  React.useEffect(() => {
    setPageIndex(0);
    setAllItems([]);
    setHasMore(true);
  }, [debouncedSearchQuery]);

  // Detectar scroll al final para cargar más datos
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const bottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (bottom && hasMore && !isFetching) {
        setPageIndex((prev) => prev + 1);
      }
    },
    [hasMore, isFetching]
  );

  return (
    <CommandList onScroll={handleScroll}>
      {isLoading && <div className="p-4 text-sm">Buscando...</div>}
      {!isError && !isLoading && !allItems.length && (
        <div className="p-4 text-sm">No se encontraron registros</div>
      )}
      {isError && (
        <div className="p-4 text-sm">Hubo un error en la búsqueda</div>
      )}

      {allItems.map((item) => {
        const key = config.getItemKey(item);
        const selectedKey = selectedResult
          ? config.getItemKey(selectedResult)
          : null;

        return (
          <CommandItem
            key={key}
            onSelect={() => onSelectResult(item)}
            value={config.getDisplayValue(item)}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedKey === key ? "opacity-100" : "opacity-0"
              )}
            />
            {config.renderItem
              ? config.renderItem(item)
              : config.getDisplayValue(item)}
          </CommandItem>
        );
      })}

      {isFetching && pageIndex > 0 && (
        <div className="p-4 text-sm text-center">Cargando más...</div>
      )}
    </CommandList>
  );
}

interface SearchProps<T> {
  selectedResult?: T;
  onSelectResult: (item: T) => void;
  config: AutocompleteSelectorConfig<T>;
}

function Search<T>({ selectedResult, onSelectResult, config }: SearchProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <Command
      shouldFilter={false}
      className="h-auto rounded-lg border border-b-0 shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder={config.placeholder ?? "Buscar..."}
      />
      <SearchResults
        query={searchQuery}
        selectedResult={selectedResult}
        onSelectResult={onSelectResult}
        config={config}
      />
    </Command>
  );
}

interface AutocompleteSelectorProps<T> {
  value?: T;
  onChange?: (item: T) => void;
  disabled?: boolean;
  config: AutocompleteSelectorConfig<T>;
}

export function AutocompleteSelector<T>({
  value,
  onChange,
  disabled = false,
  config,
}: AutocompleteSelectorProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<T | undefined>(value);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Actualizar el estado interno cuando cambie el value
  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSetActive = React.useCallback(
    (item: T) => {
      setSelected(item);
      if (onChange) {
        onChange(item);
      }
      setOpen(false);
      buttonRef?.current?.focus();
    },
    [onChange]
  );

  const displayName = config.getDisplayValue(selected);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          ref={buttonRef}
          role="combobox"
          disabled={disabled}
          className={cn("justify-between w-full text-wrap h-auto")}
        >
          {displayName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Search
          selectedResult={selected}
          onSelectResult={handleSetActive}
          config={config}
        />
      </PopoverContent>
    </Popover>
  );
}
