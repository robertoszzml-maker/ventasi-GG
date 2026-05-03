import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGrilla, registrarIngreso, ajustarCantidad, actualizarUmbrales, bulkUmbrales, copiarUmbrales, remove, actualizarCodigoBarras } from '@/services/articulo-variantes';
import { BulkUmbralPayload, IngresoItem, UmbralVariante } from '@/types';

export const useGetGrillaQuery = (articuloId: number) => {
    return useQuery({
        queryKey: ['grilla-articulo', articuloId],
        queryFn: () => fetchGrilla(articuloId),
        enabled: !!articuloId,
    });
};

export const useRegistrarIngresoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['registrar-ingreso'],
        mutationFn: ({ articuloId, items }: { articuloId: number; items: IngresoItem[] }) =>
            registrarIngreso(articuloId, items),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['articulo', variables.articuloId] });
        },
    });
};

export const useAjustarCantidadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['ajustar-cantidad'],
        mutationFn: ({ articuloId, varianteId, cantidad }: { articuloId: number; varianteId: number; cantidad: string }) =>
            ajustarCantidad(articuloId, varianteId, cantidad),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['articulo', variables.articuloId] });
        },
    });
};

export const useDeleteVarianteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-variante'],
        mutationFn: ({ articuloId, varianteId }: { articuloId: number; varianteId: number }) =>
            remove(articuloId, varianteId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
        },
    });
};

export const useActualizarUmbralVarianteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['actualizar-umbral-variante'],
        mutationFn: ({ articuloId, varianteId, dto }: { articuloId: number; varianteId: number; dto: UmbralVariante }) =>
            actualizarUmbrales(articuloId, varianteId, dto),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-anclas'] });
        },
    });
};

export const useBulkUmbralesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['bulk-umbrales'],
        mutationFn: (dto: BulkUmbralPayload) => bulkUmbrales(dto),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-anclas'] });
        },
    });
};

export const useCopiarUmbralesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['copiar-umbrales'],
        mutationFn: ({ articuloId, varianteId }: { articuloId: number; varianteId: number }) =>
            copiarUmbrales(articuloId, varianteId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-anclas'] });
        },
    });
};

export const useActualizarCodigoBarrasMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['actualizar-codigo-barras'],
        mutationFn: ({ articuloId, varianteId, codigoBarras }: { articuloId: number; varianteId: number; codigoBarras: string | null }) =>
            actualizarCodigoBarras(articuloId, varianteId, codigoBarras),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
        },
    });
};
