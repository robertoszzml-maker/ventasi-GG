import React from "react";
import { useGetPermisosQuery } from "@/hooks/permisos";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectGroup,
} from "@/components/ui/select";
import { MAX_LIMIT } from "@/constants/query";
import { Button } from '@/components/ui/button'

type PermisosSelectorProps = {
    value?: string; // Ajusta a string porque el formulario usará strings
    onChange: (value: string) => void;
};

export const PermisosSelector = ({ value = "", onChange }: PermisosSelectorProps) => {
    const { data, isLoading } = useGetPermisosQuery({
        pagination: { pageIndex: 0, pageSize: MAX_LIMIT },
        columnFilters: [],
        globalFilter: "",
        sorting: [],
    });



    return (

        <Select value={`${value}`} onValueChange={onChange} >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un permiso"} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Categorías</SelectLabel>
                    <Button
                        className="w-full text-primary"
                        variant="ghost"
                        size="sm"

                        onClick={() => {
                            onChange(''); // Borra la selección
                        }}
                    >
                        BORRAR SELECCIÓN
                    </Button>

                    {data &&
                        data.map((categoria) => (
                            <SelectItem key={categoria.id} value={`${categoria.id}`}>
                                {categoria.nombre}
                            </SelectItem>
                        ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
