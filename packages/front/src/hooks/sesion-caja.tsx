import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SesionCaja, AbrirCajaDto, CerrarCajaDto } from '@/types';
import { getSesionActiva, fetch, fetchById, abrirCaja, cerrarCaja, SesionCajaQuery } from '@/services/sesion-caja';

export const useGetSesionCajaActivaQuery = () => {
  return useQuery({
    queryKey: ['sesion-caja-activa'],
    queryFn: getSesionActiva,
    refetchInterval: 30000,
  });
};

export const useGetSesionesCajaQuery = (query: SesionCajaQuery) => {
  return useQuery({
    queryKey: ['sesiones-caja', query],
    queryFn: () => fetch(query),
  });
};

export const useGetSesionCajaByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['sesion-caja', id],
    queryFn: () => fetchById(id),
    enabled: !!id,
  });
};

export const useAbrirCajaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['abrir-caja'],
    mutationFn: (dto: AbrirCajaDto) => abrirCaja(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesion-caja-activa'] });
      queryClient.invalidateQueries({ queryKey: ['sesiones-caja'] });
    },
  });
};

export const useCerrarCajaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['cerrar-caja'],
    mutationFn: ({ id, dto }: { id: number; dto: CerrarCajaDto }) => cerrarCaja(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesion-caja-activa'] });
      queryClient.invalidateQueries({ queryKey: ['sesiones-caja'] });
    },
  });
};
