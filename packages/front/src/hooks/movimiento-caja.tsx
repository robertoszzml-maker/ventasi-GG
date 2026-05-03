import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MovimientoCaja } from '@/types';
import { fetch, fetchById, create, MovimientoCajaQuery } from '@/services/movimiento-caja';

export const useGetMovimientosCajaQuery = (query: MovimientoCajaQuery) => {
  return useQuery({
    queryKey: ['movimientos-caja', query],
    queryFn: () => fetch(query),
  });
};

export const useGetMovimientoCajaByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['movimiento-caja', id],
    queryFn: () => fetchById(id),
    enabled: !!id,
  });
};

export const useCreateMovimientoCajaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-movimiento-caja'],
    mutationFn: (dto: MovimientoCaja) => create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos-caja'] });
      queryClient.invalidateQueries({ queryKey: ['sesion-caja-activa'] });
    },
  });
};
