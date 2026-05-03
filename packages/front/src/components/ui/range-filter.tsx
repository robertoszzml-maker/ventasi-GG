import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Asegúrate de que esta importación esté correcta
import { Table as TableType } from "@tanstack/react-table";

interface RangeFilterProps<T> {
    table: TableType<T>;
    columnId: string; // Recibimos el ID de la columna por props
}

export function RangeFilter<T>({ table, columnId }: RangeFilterProps<T>) {
    const [greaterThan, setGreaterThan] = useState<string | number>(""); // Permitimos valores de tipo string o number
    const [lessThan, setLessThan] = useState<string | number>(""); // Permitimos valores de tipo string o number

    const currentFilter = table.getState().columnFilters.find(
        (filter) => filter.id === columnId
    ) as { id: string; value: { from: string | number; to: string | number } | string | undefined }; // Cambiado a formato objeto

    React.useEffect(() => {
        const value = currentFilter?.value;
        if (typeof value === 'object' && value !== null) {
            setGreaterThan(value.from || "");
            setLessThan(value.to || "");
        } else {
            setGreaterThan("");
            setLessThan("");
        }
    }, [currentFilter]);

    const handleGreaterThanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value || ""; // Permitimos cualquier valor, no solo numérico
        setGreaterThan(value);
        updateFilters(value, lessThan);
    };

    const handleLessThanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value || ""; // Permitimos cualquier valor, no solo numérico
        setLessThan(value);
        updateFilters(greaterThan, value);
    };

    const updateFilters = (greaterThan: string | number, lessThan: string | number) => {
        const currentFilters = table.getState().columnFilters;
        const updatedFilters = currentFilters.filter((filter) => filter.id !== columnId);

        if (greaterThan || lessThan) {
            updatedFilters.push({
                id: columnId,
                value: { from: greaterThan, to: lessThan },
            });
        }

        table.setColumnFilters(updatedFilters);
    };

    return (
        <div className="mt-2">
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <Input
                        id="greaterThan"
                        type="text" // Usamos tipo de texto para evitar restricciones numéricas
                        value={greaterThan || ""}
                        onChange={handleGreaterThanChange}
                        className="border p-2"
                        placeholder="Mayor a"
                    />
                </div>
                <div className="flex flex-col">
                    <Input
                        id="lessThan"
                        type="text" // Usamos tipo de texto para evitar restricciones numéricas
                        value={lessThan || ""}
                        onChange={handleLessThanChange}
                        className="border p-2"
                        placeholder="Menor a"
                    />
                </div>
            </div>
        </div>
    );
}
