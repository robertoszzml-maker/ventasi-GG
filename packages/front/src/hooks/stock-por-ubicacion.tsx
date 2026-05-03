import { useQuery } from '@tanstack/react-query';
import { fetchStockPorArticulo } from '@/services/stock-por-ubicacion';

export const useGetStockPorArticuloQuery = (articuloId: number) =>
  useQuery({
    queryKey: ['stock-por-ubicacion', 'articulo', articuloId],
    queryFn: () => fetchStockPorArticulo(articuloId),
    enabled: !!articuloId,
  });
