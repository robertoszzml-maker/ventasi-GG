import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AplicarPorcentajePayload, UpdatePrecioItem } from '@/types';
import { fetchPorLista, fetchPorArticulo, edit, updateLote, aplicarPorcentaje } from '@/services/articulo-precio';

export const useGetArticulosPrecioByListaQuery = (listaPrecioId: number) => {
    return useQuery({
        queryKey: ['articulos-precio', listaPrecioId],
        queryFn: () => fetchPorLista(listaPrecioId),
        enabled: !!listaPrecioId,
    });
};

export const useGetArticulosPrecioByArticuloQuery = (articuloId: number) => {
    return useQuery({
        queryKey: ['articulos-precio-articulo', articuloId],
        queryFn: () => fetchPorArticulo(articuloId),
        enabled: !!articuloId,
    });
};

export const useEditArticuloPrecioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-articulo-precio'],
        mutationFn: ({ id, precio }: { id: number; precio: number }) => edit(id, { precio }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulos-precio'] });
        },
    });
};

export const useUpdatePrecioLoteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-precio-lote'],
        mutationFn: (items: UpdatePrecioItem[]) => updateLote(items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulos-precio'] });
        },
    });
};

export const useAplicarPorcentajeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['aplicar-porcentaje-precios'],
        mutationFn: (body: AplicarPorcentajePayload) => aplicarPorcentaje(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articulos-precio'] });
        },
    });
};
