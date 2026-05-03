import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CurvaTalle, Query } from '@/types';
import { fetch, fetchById, create, edit, updateTalles, remove } from '@/services/curvas-talle';

export const useGetCurvasTalleQuery = (query: Query) => {
    return useQuery({
        queryKey: ['curvas-talle', query],
        queryFn: () => fetch(query),
    });
};

export const useGetCurvaTalleByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['curva-talle', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateCurvasTalleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-curva-talle'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-talle'] });
        },
    });
};

export const useEditCurvasTalleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-curva-talle'],
        mutationFn: ({ id, data }: { id: number; data: CurvaTalle }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-talle'] });
        },
    });
};

export const useUpdateTallesCurvaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-talles-curva'],
        mutationFn: ({ id, talleIds }: { id: number; talleIds: number[] }) => updateTalles(id, talleIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-talle'] });
            queryClient.invalidateQueries({ queryKey: ['curva-talle'] });
        },
    });
};

export const useDeleteCurvasTalleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-curva-talle'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['curvas-talle'] });
        },
    });
};
