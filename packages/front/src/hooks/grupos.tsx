import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Grupo, Query } from '@/types';
import { fetch, fetchById, fetchByFamiliaId, create, edit, remove } from '@/services/grupos';

export const useGetGruposQuery = (query: Query) => {
    return useQuery({
        queryKey: ['grupos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetGrupoByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['grupo', id],
        queryFn: () => fetchById(id),
    });
};

export const useGetGruposByFamiliaIdQuery = (familiaId: number) => {
    return useQuery({
        queryKey: ['grupos-familia', familiaId],
        queryFn: () => fetchByFamiliaId(familiaId),
        enabled: !!familiaId,
    });
};

export const useCreateGruposMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-grupo'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grupos'] });
        },
    });
};

export const useEditGruposMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-grupo'],
        mutationFn: ({ id, data }: { id: number; data: Grupo }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grupos'] });
        },
    });
};

export const useDeleteGruposMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-grupo'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grupos'] });
        },
    });
};
