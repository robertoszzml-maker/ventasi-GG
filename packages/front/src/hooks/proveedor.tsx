import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Proveedor, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/proveedor';

export const useGetProveedoresQuery = (query: Query) => {
    return useQuery({
        queryKey: ['proveedores', query],
        queryFn: () => fetch(query),
    });
};

export const useGetProveedorByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['proveedor', id],
        queryFn: () => fetchById(id),
    });
};

export const useCreateProveedorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-proveedor'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
    });
};

export const useEditProveedorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-proveedor'],
        mutationFn: ({ id, data }: { id: number; data: Proveedor }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
    });
};

export const useDeleteProveedorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-proveedor'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
        onError: (error) => {
            console.error('Error al eliminar proveedor:', error);
        },
    });
};
