import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Familia, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/familias';

export const useGetFamiliasQuery = (query: Query) => {
    return useQuery({
        queryKey: ['familias', query],
        queryFn: () => fetch(query),
    });
};

export const useGetFamiliaByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['familia', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateFamiliasMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-familia'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['familias'] });
        },
    });
};

export const useEditFamiliasMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-familia'],
        mutationFn: ({ id, data }: { id: number; data: Familia }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['familias'] });
        },
    });
};

export const useDeleteFamiliasMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-familia'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['familias'] });
        },
    });
};
