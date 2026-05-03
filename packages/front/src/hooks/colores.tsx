import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Color, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/colores';

export const useGetColoresQuery = (query: Query) => {
    return useQuery({
        queryKey: ['colores', query],
        queryFn: () => fetch(query),
    });
};

export const useGetColorByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['color', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateColoresMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-color'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colores'] });
        },
    });
};

export const useEditColoresMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-color'],
        mutationFn: ({ id, data }: { id: number; data: Color }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colores'] });
        },
    });
};

export const useDeleteColoresMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-color'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colores'] });
        },
    });
};
