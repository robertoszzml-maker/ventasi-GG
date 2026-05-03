import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Talle, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/talles';

export const useGetTallesQuery = (query: Query) => {
    return useQuery({
        queryKey: ['talles', query],
        queryFn: () => fetch(query),
    });
};

export const useGetTalleByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['talle', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateTallesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-talle'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talles'] });
        },
    });
};

export const useEditTallesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-talle'],
        mutationFn: ({ id, data }: { id: number; data: Talle }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talles'] });
        },
    });
};

export const useDeleteTallesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-talle'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talles'] });
        },
    });
};
