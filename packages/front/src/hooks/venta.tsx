import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Venta, Query } from '@/types';
import { fetch, fetchById, fetchRaw, create, guardar, confirmar, emitirManual, emitirFiscal, reintentar, anular, VentaRawQuery } from '@/services/venta';

export const useGetVentasQuery = (query: Query) =>
    useQuery({ queryKey: ['ventas', query], queryFn: () => fetch(query) });

export const useGetVentasRawQuery = (query: VentaRawQuery) =>
    useQuery({ queryKey: ['ventas-raw', query], queryFn: () => fetchRaw(query) });

export const useGetVentaByIdQuery = (id: number) =>
    useQuery({ queryKey: ['venta', id], queryFn: () => fetchById(id), enabled: !!id });

export const useCreateVentaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['create-venta'],
        mutationFn: create,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['ventas'] }),
    });
};

export const useGuardarVentaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['guardar-venta'],
        mutationFn: ({ id, data }: { id: number; data: Venta }) => guardar(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['ventas'] });
            qc.invalidateQueries({ queryKey: ['venta', id] });
        },
    });
};

export const useConfirmarVentaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['confirmar-venta'],
        mutationFn: confirmar,
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: ['ventas'] });
            qc.invalidateQueries({ queryKey: ['venta', id] });
        },
    });
};

export const useEmitirManualMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['emitir-manual'],
        mutationFn: ({ id, formato }: { id: number; formato?: string }) => emitirManual(id, formato),
        onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ['venta', id] }),
    });
};

export const useEmitirFiscalMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['emitir-fiscal'],
        mutationFn: ({ id, formato }: { id: number; formato?: string }) => emitirFiscal(id, formato),
        onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ['venta', id] }),
    });
};

export const useReintentarMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['reintentar-cae'],
        mutationFn: reintentar,
        onSuccess: (data) => qc.invalidateQueries({ queryKey: ['venta', data?.ventaId] }),
    });
};

export const useAnularVentaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['anular-venta'],
        mutationFn: anular,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['ventas'] }),
    });
};
