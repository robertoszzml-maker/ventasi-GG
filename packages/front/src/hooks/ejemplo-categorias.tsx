import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EjemploCategoria, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/ejemplo-categorias';

export const useGetEjemploCategoriasQuery = (query: Query) => {
    return useQuery({
        queryKey: ['ejemplo-categorias', query],
        queryFn: () => fetch(query),
    });
};

export const useGetEjemploCategoriaByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['ejemplo-categoria', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateEjemploCategoriaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-ejemplo-categoria'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplo-categorias'] });
        },
    });
};

export const useEditEjemploCategoriaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-ejemplo-categoria'],
        mutationFn: ({ id, data }: { id: number; data: EjemploCategoria }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplo-categorias'] });
        },
    });
};

export const useDeleteEjemploCategoriaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-ejemplo-categoria'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplo-categorias'] });
        },
        onError: (error) => {
            console.error('Error al eliminar categoría:', error);
        },
    });
};
