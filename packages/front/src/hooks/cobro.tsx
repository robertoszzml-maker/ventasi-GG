import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCobroPayload } from '@/types';
import { fetchPorVenta, create, remove } from '@/services/cobro';

export const useCobrosPorVentaQuery = (ventaId: number | undefined) => {
  return useQuery({
    queryKey: ['cobros', ventaId],
    queryFn: () => fetchPorVenta(ventaId!),
    enabled: !!ventaId,
  });
};

export const useCrearCobroMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['crear-cobro'],
    mutationFn: (data: CreateCobroPayload) => create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cobros', variables.ventaId] });
    },
  });
};

export const useEliminarCobroMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['eliminar-cobro'],
    mutationFn: ({ id }: { id: number; ventaId: number }) => remove(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cobros', variables.ventaId] });
    },
  });
};
