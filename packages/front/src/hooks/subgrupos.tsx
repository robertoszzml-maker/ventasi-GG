import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Subgrupo, Query } from '@/types';
import { fetch, fetchById, fetchByGrupoId, create, edit, remove } from '@/services/subgrupos';

export const useGetSubgruposQuery = (query: Query) => {
    return useQuery({
        queryKey: ['subgrupos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetSubgrupoByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['subgrupo', id],
        queryFn: () => fetchById(id),
    });
};

export const useGetSubgruposByGrupoIdQuery = (grupoId: number) => {
    return useQuery({
        queryKey: ['subgrupos-grupo', grupoId],
        queryFn: () => fetchByGrupoId(grupoId),
        enabled: !!grupoId,
    });
};

export const useCreateSubgruposMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-subgrupo'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subgrupos'] });
        },
    });
};

export const useEditSubgruposMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-subgrupo'],
        mutationFn: ({ id, data }: { id: number; data: Subgrupo }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subgrupos'] });
        },
    });
};

export const useDeleteSubgruposMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-subgrupo'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subgrupos'] });
        },
    });
};
