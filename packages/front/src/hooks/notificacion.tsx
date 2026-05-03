import { create, edit, fetch, fetchById, remove } from '@/services/notificacion';
import { Notificacion, Query } from '@/types';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetNotificacionesQuery = (query: Query) => {
    // Solo cargar si hay sesión
    const hasSession = typeof window !== 'undefined' && !!sessionStorage.getItem('tokenAuth');
    
    return useQuery({
        queryKey: ['notificaciones', query],
        queryFn: () => fetch(query),
        refetchInterval: 20000,
        placeholderData: keepPreviousData,
        enabled: hasSession, // Solo ejecutar si hay sesión
    });
};

export const useGetNotificacionByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['notificacion', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateNotificacionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-notificacion'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
        },
    });
};

export const useEditNotificacionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-notificacion'],
        mutationFn: ({ id, data }: { id: number; data: Notificacion }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
        },
    });
};

export const useDeleteNotificacionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-notificacion'],
        mutationFn: ({ id }: { id: number; }) => remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
