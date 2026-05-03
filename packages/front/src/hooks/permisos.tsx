import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Permiso, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/role';

export const useGetPermisosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['permisos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetPermisoByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['permiso', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreatePermisoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-Permiso'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permisos'] });
        },
    });
};

export const useEditPermisoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-Permiso'],
        mutationFn: ({ id, data }: { id: number; data: Permiso }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permisos'] });
        },
    });
};

export const useDeletePermisoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-Permiso'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permisos'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
