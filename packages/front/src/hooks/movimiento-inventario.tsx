import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MovimientoInventario, Query } from '@/types';
import { fetch, fetchById, create } from '@/services/movimiento-inventario';

export const useGetMovimientosInventarioQuery = (query: Query) => {
    return useQuery({
        queryKey: ['movimientos-inventario', query],
        queryFn: () => fetch(query),
    });
};

export const useGetMovimientoInventarioByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['movimiento-inventario', id],
        queryFn: () => fetchById(id),
        enabled: !!id,
    });
};

export const useCreateMovimientoInventarioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-movimiento-inventario'],
        mutationFn: (data: MovimientoInventario) => create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movimientos-inventario'] });
        },
    });
};
