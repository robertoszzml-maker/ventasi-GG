import { ArqueoCaja } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'arqueos-caja';

export type ArqueoCajaQuery = {
  limit?: number;
  skip?: number;
  filter?: string;
  order?: string;
};

const fetch = async (query: ArqueoCajaQuery): Promise<ArqueoCaja[]> => {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.skip !== undefined) params.set('skip', String(query.skip));
  if (query.filter) params.set('filter', query.filter);
  if (query.order) params.set('order', query.order);
  return fetchClient<ArqueoCaja[]>(`${basePath}?${params.toString()}`, 'GET');
};

const fetchById = async (id: number): Promise<ArqueoCaja> => {
  return fetchClient<ArqueoCaja>(`${basePath}/${id}`, 'GET');
};

const create = async (body: ArqueoCaja): Promise<ArqueoCaja> => {
  return fetchClient<ArqueoCaja>(basePath, 'POST', body);
};

export {
  fetch,
  fetchById,
  create,
};
