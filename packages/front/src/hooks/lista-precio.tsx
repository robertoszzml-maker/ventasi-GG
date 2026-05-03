import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListaPrecio, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/lista-precio';

export const useGetListasPrecioQuery = (query: Query) => {
    return useQuery({
        queryKey: ['listas-precio', query],
        queryFn: () => fetch(query),
    });
};

export const useGetListaPrecioByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['lista-precio', id],
        queryFn: () => fetchById(id),
        enabled: !!id,
    });
};

export const useCreateListaPrecioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-lista-precio'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listas-precio'] });
        },
    });
};

export const useEditListaPrecioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-lista-precio'],
        mutationFn: ({ id, data }: { id: number; data: Partial<ListaPrecio> }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listas-precio'] });
        },
    });
};

export const useDeleteListaPrecioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-lista-precio'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listas-precio'] });
        },
        onError: (error) => {
            console.error('Error al eliminar lista de precios:', error);
        },
    });
};
