import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ubicacion, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/ubicacion';

export const useGetUbicacionesQuery = (query: Query) => {
    return useQuery({
        queryKey: ['ubicaciones', query],
        queryFn: () => fetch(query),
    });
};

export const useGetUbicacionByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['ubicacion', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateUbicacionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-ubicacion'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
        },
    });
};

export const useEditUbicacionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-ubicacion'],
        mutationFn: ({ id, data }: { id: number; data: Ubicacion }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
        },
    });
};

export const useDeleteUbicacionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-ubicacion'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
        },
        onError: (error) => {
            console.error('Error al eliminar ubicación:', error);
        },
    });
};
