import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RazonNoCompra, SubRazonNoCompra, Query } from '@/types';
import { fetchTodas, fetchById, fetchActivas, create, edit, createSubRazon, editSubRazon } from '@/services/razon-no-compra';

export const useGetRazonesNoCompraQuery = (query?: Query) => {
    return useQuery({
        queryKey: ['razones-no-compra', query],
        queryFn: fetchTodas,
    });
};

export const useGetRazonByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['razon-no-compra', id],
        queryFn: () => fetchById(id),
        enabled: !!id,
    });
};

export const useGetRazonesActivasQuery = () => {
    return useQuery({
        queryKey: ['razones-no-compra-activas'],
        queryFn: fetchActivas,
    });
};

export const useCreateRazonNoCompraMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-razon-no-compra'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra'] });
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra-activas'] });
        },
    });
};

export const useUpdateRazonNoCompraMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-razon-no-compra'],
        mutationFn: ({ id, data }: { id: number; data: Partial<RazonNoCompra> }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra'] });
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra-activas'] });
        },
    });
};

export const useCreateSubRazonMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-sub-razon'],
        mutationFn: ({ razonId, data }: { razonId: number; data: Partial<SubRazonNoCompra> }) =>
            createSubRazon(razonId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra'] });
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra-activas'] });
            queryClient.invalidateQueries({ queryKey: ['razon-no-compra', variables.razonId] });
        },
    });
};

export const useUpdateSubRazonMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-sub-razon'],
        mutationFn: ({ id, data }: { id: number; data: Partial<SubRazonNoCompra> }) => editSubRazon(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra'] });
            queryClient.invalidateQueries({ queryKey: ['razones-no-compra-activas'] });
            queryClient.invalidateQueries({ queryKey: ['razon-no-compra'] });
        },
    });
};
