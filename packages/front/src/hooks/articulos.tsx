import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Articulo, Query } from '@/types';
import { fetch, fetchById, create, edit, addTalle, addColor, remove, fetchDashboardAnclas } from '@/services/articulos';

export const useGetArticulosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['articulos', query],
        queryFn: () => fetch(query),
    });
};

export const useGetArticuloByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['articulo', id],
        queryFn: () => fetchById(id),
    });
};

export const useGetArticuloTallesQuery = (id: number) => {
    return useQuery({
        queryKey: ['articulo-talles', id],
        queryFn: () => fetchById(id),
        select: (data) => data.talles ?? [],
    });
};

export const useGetArticuloColoresQuery = (id: number) => {
    return useQuery({
        queryKey: ['articulo-colores', id],
        queryFn: () => fetchById(id),
        select: (data) => data.colores ?? [],
    });
};

export const useCreateArticulosMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-articulo'],
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulos'] });
        },
    });
};

export const useEditArticulosMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-articulo'],
        mutationFn: ({ id, data }: { id: number; data: Articulo }) => edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulos'] });
            queryClient.invalidateQueries({ queryKey: ['articulo'] });
        },
    });
};

export const useAddTalleArticuloMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['add-talle-articulo'],
        mutationFn: ({ id, talleId, orden }: { id: number; talleId: number; orden?: number }) =>
            addTalle(id, { talleId, orden }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulo'] });
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo'] });
        },
    });
};

export const useAddColorArticuloMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['add-color-articulo'],
        mutationFn: ({ id, colorId, orden }: { id: number; colorId: number; orden?: number }) =>
            addColor(id, { colorId, orden }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulo'] });
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo'] });
        },
    });
};

export const useDeleteArticulosMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-articulo'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulos'] });
        },
    });
};

export const useGetDashboardAnclasQuery = () => {
    return useQuery({
        queryKey: ['dashboard-anclas'],
        queryFn: fetchDashboardAnclas,
    });
};
