import React from "react";
import { Table as TableType } from "@tanstack/react-table";
import { ProcesoGeneralSelectorMultiple } from "@/components/selectors/proceso-general-selector-multiple";

interface MultiSelectFilterProps<T> {
  table: TableType<T>;
  columnId: string;
}

function MultiSelectFilter<T>({ table, columnId }: MultiSelectFilterProps<T>) {
  const rawValue = table
    .getState()
    .columnFilters.find((f) => f.id === columnId)?.value;
  const defaultValue: string[] = Array.isArray(rawValue) ? rawValue : [];

  const [selected, setSelected] = React.useState<string[]>(defaultValue);

  React.useEffect(() => {
    setSelected(defaultValue);
  }, [JSON.stringify(defaultValue)]);

  const handleChange = (value: string[]) => {
    setSelected(value);
    table.setColumnFilters((prevFilters) => {
      const updatedFilters = prevFilters.filter((f) => f.id !== columnId);
      if (value.length > 0) {
        updatedFilters.push({ id: columnId, value });
      }
      return updatedFilters;
    });
  };

  const selectorMap: Record<string, JSX.Element> = {
    ["procesoGeneral.nombre"]: (
      <ProcesoGeneralSelectorMultiple value={selected} onChange={handleChange} />
    ),
  };

  return (
    <div className="mt-2 overflow-hidden">{selectorMap[columnId] || null}</div>
  );
}

export { MultiSelectFilter };
