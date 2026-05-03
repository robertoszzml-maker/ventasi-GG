import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConceptoMovimiento } from '@/types';
import { fetch, fetchById, fetchActivos, create, edit, remove, ConceptoMovimientoQuery } from '@/services/concepto-movimiento';

export const useGetConceptosMovimientoQuery = (query: ConceptoMovimientoQuery) => {
  return useQuery({
    queryKey: ['conceptos-movimiento', query],
    queryFn: () => fetch(query),
  });
};

export const useGetConceptosMovimientoActivosQuery = () => {
  return useQuery({
    queryKey: ['conceptos-movimiento-activos'],
    queryFn: fetchActivos,
  });
};

export const useGetConceptoMovimientoByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['concepto-movimiento', id],
    queryFn: () => fetchById(id),
    enabled: !!id,
  });
};

export const useCreateConceptoMovimientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-concepto-movimiento'],
    mutationFn: (dto: ConceptoMovimiento) => create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conceptos-movimiento'] });
      queryClient.invalidateQueries({ queryKey: ['conceptos-movimiento-activos'] });
    },
  });
};

export const useEditConceptoMovimientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['edit-concepto-movimiento'],
    mutationFn: ({ id, data }: { id: number; data: ConceptoMovimiento }) => edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conceptos-movimiento'] });
      queryClient.invalidateQueries({ queryKey: ['conceptos-movimiento-activos'] });
    },
  });
};

export const useDeleteConceptoMovimientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-concepto-movimiento'],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conceptos-movimiento'] });
      queryClient.invalidateQueries({ queryKey: ['conceptos-movimiento-activos'] });
    },
  });
};
