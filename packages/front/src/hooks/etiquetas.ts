import { useQuery } from '@tanstack/react-query';
import { fetchVariantesParaEtiquetas } from '@/services/etiquetas';

export const useGetVariantesParaEtiquetasQuery = (articuloIds: number[]) => {
    return useQuery({
        queryKey: ['variantes-etiquetas', articuloIds],
        queryFn: () => fetchVariantesParaEtiquetas(articuloIds),
        enabled: articuloIds.length > 0,
    });
};
