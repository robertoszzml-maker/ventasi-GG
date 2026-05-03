import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CurvaColor, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/curvas-color';

export const useGetCurvasColorQuery = (query: Query) => {
    return useQuery({
        queryKey: ['curvas-color', query],
        queryFn: () => fetch(query),
    });
};

export const useGetCurvaColorByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['curva-color', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateCurvasColorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-curva-color'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-color'] });
        },
    });
};

export const useEditCurvasColorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-curva-color'],
        mutationFn: ({ id, data }: { id: number; data: CurvaColor }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-color'] });
        },
    });
};

export const useDeleteCurvasColorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-curva-color'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-color'] });
        },
    });
};
