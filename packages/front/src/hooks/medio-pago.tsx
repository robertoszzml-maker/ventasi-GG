import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MedioPago, Query } from '@/types';
import { fetch, fetchActivos, fetchPorCodigo, create, edit, remove } from '@/services/medio-pago';

export const useGetMediosPagoQuery = (query: Query) => {
  return useQuery({
    queryKey: ['medios-pago', query],
    queryFn: () => fetch(query),
  });
};

export const useGetMediosPagoActivosQuery = () => {
  return useQuery({
    queryKey: ['medios-pago-activos'],
    queryFn: fetchActivos,
  });
};

export const useGetMedioPagoPorCodigoQuery = (codigo: string, enabled = false) => {
  return useQuery({
    queryKey: ['medio-pago-codigo', codigo],
    queryFn: () => fetchPorCodigo(codigo),
    enabled: enabled && codigo.length >= 2,
    retry: false,
  });
};

export const useCreateMedioPagoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-medio-pago'],
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medios-pago'] });
      queryClient.invalidateQueries({ queryKey: ['medios-pago-activos'] });
    },
  });
};

export const useEditMedioPagoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['edit-medio-pago'],
    mutationFn: ({ id, data }: { id: number; data: Partial<MedioPago> }) => edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medios-pago'] });
      queryClient.invalidateQueries({ queryKey: ['medios-pago-activos'] });
    },
  });
};

export const useDeleteMedioPagoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-medio-pago'],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medios-pago'] });
      queryClient.invalidateQueries({ queryKey: ['medios-pago-activos'] });
    },
  });
};
