import { MovimientoCaja } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'movimientos-caja';

export type MovimientoCajaQuery = {
  limit?: number;
  skip?: number;
  filter?: string;
  order?: string;
};

const fetch = async (query: MovimientoCajaQuery): Promise<MovimientoCaja[]> => {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.skip !== undefined) params.set('skip', String(query.skip));
  if (query.filter) params.set('filter', query.filter);
  if (query.order) params.set('order', query.order);
  return fetchClient<MovimientoCaja[]>(`${basePath}?${params.toString()}`, 'GET');
};

const fetchById = async (id: number): Promise<MovimientoCaja> => {
  return fetchClient<MovimientoCaja>(`${basePath}/${id}`, 'GET');
};

const create = async (body: MovimientoCaja): Promise<MovimientoCaja> => {
  return fetchClient<MovimientoCaja>(basePath, 'POST', body);
};

export {
  fetch,
  fetchById,
  create,
};
