import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetodoPago, CuotaMetodoPago, Query } from '@/types';
import { fetch, fetchById, create, edit, remove, addCuota, editCuota, removeCuota } from '@/services/metodo-pago';

export const useGetMetodosPagoQuery = (query: Query) =>
    useQuery({ queryKey: ['metodos-pago', query], queryFn: () => fetch(query) });

export const useGetMetodoPagoByIdQuery = (id: number) =>
    useQuery({ queryKey: ['metodo-pago', id], queryFn: () => fetchById(id), enabled: !!id });

export const useCreateMetodoPagoMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['create-metodo-pago'],
        mutationFn: create,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['metodos-pago'] }),
    });
};

export const useEditMetodoPagoMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['edit-metodo-pago'],
        mutationFn: ({ id, data }: { id: number; data: Partial<MetodoPago> }) => edit(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['metodos-pago'] }),
    });
};

export const useDeleteMetodoPagoMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['delete-metodo-pago'],
        mutationFn: remove,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['metodos-pago'] }),
    });
};

export const useAddCuotaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['add-cuota'],
        mutationFn: ({ metodoPagoId, data }: { metodoPagoId: number; data: Partial<CuotaMetodoPago> }) =>
            addCuota(metodoPagoId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['metodos-pago'] }),
    });
};

export const useEditCuotaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['edit-cuota'],
        mutationFn: ({ cuotaId, data }: { cuotaId: number; data: Partial<CuotaMetodoPago> }) =>
            editCuota(cuotaId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['metodos-pago'] }),
    });
};

export const useRemoveCuotaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['remove-cuota'],
        mutationFn: removeCuota,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['metodos-pago'] }),
    });
};
