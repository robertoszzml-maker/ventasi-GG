import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CaracteristicaVisitante, Query } from '@/types';
import { fetch, fetchById, fetchActivas, create, edit, remove } from '@/services/caracteristica-visitante';

export const useGetCaracteristicasVisitanteQuery = (query: Query) => {
    return useQuery({
        queryKey: ['caracteristicas-visitante', query],
        queryFn: () => fetch(query),
    });
};

export const useGetCaracteristicaByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['caracteristica-visitante', id],
        queryFn: () => fetchById(id),
        enabled: !!id,
    });
};

export const useGetCaracteristicasActivasQuery = () => {
    return useQuery({
        queryKey: ['caracteristicas-visitante-activas'],
        queryFn: fetchActivas,
    });
};

export const useCreateCaracteristicaVisitanteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-caracteristica-visitante'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caracteristicas-visitante'] });
            queryClient.invalidateQueries({ queryKey: ['caracteristicas-visitante-activas'] });
        },
    });
};

export const useUpdateCaracteristicaVisitanteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-caracteristica-visitante'],
        mutationFn: ({ id, data }: { id: number; data: Partial<CaracteristicaVisitante> }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caracteristicas-visitante'] });
            queryClient.invalidateQueries({ queryKey: ['caracteristicas-visitante-activas'] });
        },
    });
};

export const useDeleteCaracteristicaVisitanteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-caracteristica-visitante'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caracteristicas-visitante'] });
            queryClient.invalidateQueries({ queryKey: ['caracteristicas-visitante-activas'] });
        },
    });
};
