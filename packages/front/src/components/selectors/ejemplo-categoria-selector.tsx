'use client';

import { AutocompleteSelector } from '@/components/selectors/autocomplete-selector';
import { useGetEjemploCategoriasQuery } from '@/hooks/ejemplo-categorias';
import { EjemploCategoria } from '@/types';

interface EjemploCategoriasSelectorProps {
    value?: EjemploCategoria;
    onChange?: (value: EjemploCategoria) => void;
    disabled?: boolean;
}

const config = {
    useQuery: useGetEjemploCategoriasQuery,
    searchField: 'nombre',
    getDisplayValue: (item: EjemploCategoria | undefined) => {
        if (!item) return 'Seleccione una categoría';
        return item.nombre;
    },
    getItemKey: (item: EjemploCategoria) => item.id!,
    placeholder: 'Buscar categoría...',
};

export function EjemploCategoriaSelector({ value, onChange, disabled }: EjemploCategoriasSelectorProps) {
    return (
        <AutocompleteSelector
            config={config}
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
    );
}
