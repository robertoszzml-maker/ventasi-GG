import fetchClient from '@/lib/api-client';
import { StockPorUbicacion } from '@/types';

export const fetchStockPorArticulo = (articuloId: number): Promise<StockPorUbicacion[]> =>
  fetchClient(`stock-por-ubicacion/articulo/${articuloId}`, 'GET');
