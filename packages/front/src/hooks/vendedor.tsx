import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vendedor, Query } from '@/types';
import { fetch, fetchById, create, edit, remove } from '@/services/vendedor';

export const useGetVendedoresQuery = (query: Query) =>
    useQuery({ queryKey: ['vendedores', query], queryFn: () => fetch(query) });

export const useGetVendedorByIdQuery = (id: number) =>
    useQuery({ queryKey: ['vendedor', id], queryFn: () => fetchById(id), enabled: !!id });

export const useCreateVendedorMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['create-vendedor'],
        mutationFn: create,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vendedores'] }),
    });
};

export const useEditVendedorMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['edit-vendedor'],
        mutationFn: ({ id, data }: { id: number; data: Partial<Vendedor> }) => edit(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vendedores'] }),
    });
};

export const useDeleteVendedorMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['delete-vendedor'],
        mutationFn: remove,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vendedores'] }),
    });
};
