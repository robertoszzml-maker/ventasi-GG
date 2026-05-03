import React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectGroup,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MAX_LIMIT } from "@/constants/query";

type BaseItem = { id: string | number; nombre: string };

type HookSelectorProps = {
    value?: string;
    onChange: (value: string) => void;
    hook: (args: {
        pagination: { pageIndex: number; pageSize: number };
        columnFilters: never[];
        globalFilter: string;
        sorting: never[];
    }) => { data?: BaseItem[]; isLoading: boolean };
};

export const HookSelector = ({ value = "", onChange, hook }: HookSelectorProps) => {
    const { data, isLoading } = hook({
        pagination: { pageIndex: 0, pageSize: MAX_LIMIT },
        columnFilters: [],
        globalFilter: "",
        sorting: [],
    });

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona una opción"} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Opciones</SelectLabel>
                    <Button
                        className="w-full text-primary"
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange("")}
                    >
                        BORRAR SELECCIÓN
                    </Button>
                    {data?.map((item) => (
                        <SelectItem key={item.id} value={item.nombre}>
                            {item.nombre}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
