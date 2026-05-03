import { create, edit, fetch, fetchById, remove } from '@/services/mensaje';
import { Mensaje, Query } from '@/types';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetMensajesQuery = (query: Query) => {
    return useQuery({
        queryKey: ['mensajes'],
        queryFn: () => fetch(query),
        placeholderData: keepPreviousData,
        refetchInterval: 30000, // TODO: Cambie a 30 segundos, antes estaba en 1 segundo
    });
};

export const useGetMensajesOldQuery = (query: Query) => {
    return useQuery({
        queryKey: ['mensajes-old', query],
        queryFn: () => fetch(query),
        placeholderData: keepPreviousData,
    });
};


export const useGetMensajeByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['mensaje', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateMensajeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-mensaje'],
        mutationFn: create,
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ['mensajes'] });
        },
        onMutate: async (newMensaje) => {
            // Cancelar cualquier consulta en curso para evitar sobrescribir los datos
            await queryClient.cancelQueries({ queryKey: ['mensajes'] });

            // Obtener los mensajes actuales
            const previousMensajes = queryClient.getQueryData(['mensajes']) as Mensaje[];

            // Agregar el nuevo mensaje a la caché de manera optimista
            queryClient.setQueryData(['mensajes'], (oldData: Mensaje[] | undefined) => {
                if (!oldData) return [newMensaje];
                return [...oldData, newMensaje];
            });

            // Devolver el contexto para revertir en caso de error
            return { previousMensajes };
        },
    });
};

export const useEditMensajeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-mensaje'],
        mutationFn: ({ id, data }: { id: number; data: Mensaje }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mensajes'] });
        },
    });
};

export const useDeleteMensajeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-mensaje'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mensajes'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};
