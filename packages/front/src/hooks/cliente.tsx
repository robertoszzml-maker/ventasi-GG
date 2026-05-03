import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cliente, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/cliente';

export const useGetClientesQuery = (query: Query) => {
    return useQuery({
        queryKey: ['clientes', query],
        queryFn: () => fetch(query),
    });
};

export const useGetClienteByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['cliente', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateClienteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-cliente'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });
};

export const useEditClienteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-cliente'],
        mutationFn: ({ id, data }: { id: number; data: Cliente }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });
};

export const useDeleteClienteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-cliente'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
        onError: (error) => {
            console.error('Error al eliminar cliente:', error);
        },
    });
};
