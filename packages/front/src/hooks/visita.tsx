import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crear, resolverCompra, resolverNoCompra, fetchPendientes, fetchMetricasDia, fetchDashboard } from '@/services/visita';

export const useCreateVisitaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-visita'],
        mutationFn: crear,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitas-pendientes'] });
            queryClient.invalidateQueries({ queryKey: ['metricas-dia'] });
        },
    });
};

export const useResolverCompraMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['resolver-compra'],
        mutationFn: ({ id, movimientoId }: { id: number; movimientoId: number }) =>
            resolverCompra(id, movimientoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitas-pendientes'] });
            queryClient.invalidateQueries({ queryKey: ['metricas-dia'] });
        },
    });
};

export const useResolverNoCompraMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['resolver-no-compra'],
        mutationFn: ({ id, data }: {
            id: number;
            data: { razonId: number; subRazonId?: number; articuloId?: number; clienteId?: number; observaciones?: string };
        }) => resolverNoCompra(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitas-pendientes'] });
            queryClient.invalidateQueries({ queryKey: ['metricas-dia'] });
        },
    });
};

export const useGetVisitasPendientesQuery = () => {
    return useQuery({
        queryKey: ['visitas-pendientes'],
        queryFn: fetchPendientes,
        refetchInterval: 10000,
    });
};

export const useGetMetricasDiaQuery = () => {
    return useQuery({
        queryKey: ['metricas-dia'],
        queryFn: fetchMetricasDia,
        refetchInterval: 10000,
    });
};

export const useGetDashboardConversionQuery = (periodo: 'hoy' | 'semana' | 'mes') => {
    return useQuery({
        queryKey: ['dashboard-conversion', periodo],
        queryFn: () => fetchDashboard(periodo),
        refetchInterval: periodo === 'hoy' ? 15000 : false,
    });
};
