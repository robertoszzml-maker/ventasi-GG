import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArqueoCaja } from '@/types';
import { fetch, fetchById, create, ArqueoCajaQuery } from '@/services/arqueo-caja';

export const useGetArqueosCajaQuery = (query: ArqueoCajaQuery) => {
  return useQuery({
    queryKey: ['arqueos-caja', query],
    queryFn: () => fetch(query),
  });
};

export const useGetArqueoCajaByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['arqueo-caja', id],
    queryFn: () => fetchById(id),
    enabled: !!id,
  });
};

export const useCreateArqueoCajaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-arqueo-caja'],
    mutationFn: (dto: ArqueoCaja) => create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arqueos-caja'] });
      queryClient.invalidateQueries({ queryKey: ['sesion-caja-activa'] });
    },
  });
};
