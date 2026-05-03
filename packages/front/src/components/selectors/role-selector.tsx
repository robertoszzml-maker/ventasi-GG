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

type RoleSelectorProps = {
    value?: string;
    onChange: (value: string) => void;
};

export const RoleSelector = ({ value = "", onChange }: RoleSelectorProps) => {
    const { data, isLoading } = useGetPermisosQuery({
        pagination: { pageIndex: 0, pageSize: MAX_LIMIT },
        columnFilters: [],
        globalFilter: "",
        sorting: [],
    });

    return (
        <Select value={`${value}`} onValueChange={onChange} >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un rol"} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <Button
                        className="w-full text-primary"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onChange('');
                        }}
                    >
                        BORRAR SELECCIÓN
                    </Button>

                    {data &&
                        data.map((role) => (
                            <SelectItem key={role.id} value={`${role.id}`}>
                                {role.nombre}
                            </SelectItem>
                        ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
