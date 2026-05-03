import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ejemplo, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/ejemplos';

export const useGetEjemplosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['ejemplos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetEjemploByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['ejemplo', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateEjemploMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-ejemplo'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplos'] });
        },
    });
};

export const useEditEjemploMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-ejemplo'],
        mutationFn: ({ id, data }: { id: number; data: Ejemplo }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplos'] });
        },
    });
};

export const useDeleteEjemploMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-ejemplo'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplos'] });
        },
        onError: (error) => {
            console.error('Error al eliminar ejemplo:', error);
        },
    });
};
