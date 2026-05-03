import { ConceptoMovimiento } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'conceptos-movimiento';

export type ConceptoMovimientoQuery = {
  limit?: number;
  skip?: number;
  filter?: string;
  order?: string;
};

const fetch = async (query: ConceptoMovimientoQuery): Promise<ConceptoMovimiento[]> => {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.skip !== undefined) params.set('skip', String(query.skip));
  if (query.filter) params.set('filter', query.filter);
  if (query.order) params.set('order', query.order);
  return fetchClient<ConceptoMovimiento[]>(`${basePath}?${params.toString()}`, 'GET');
};

const fetchById = async (id: number): Promise<ConceptoMovimiento> => {
  return fetchClient<ConceptoMovimiento>(`${basePath}/${id}`, 'GET');
};

const fetchActivos = async (): Promise<ConceptoMovimiento[]> => {
  return fetchClient<ConceptoMovimiento[]>(`${basePath}/activos`, 'GET');
};

const create = async (body: ConceptoMovimiento): Promise<ConceptoMovimiento> => {
  return fetchClient<ConceptoMovimiento>(basePath, 'POST', body);
};

const edit = async (id: number, body: ConceptoMovimiento): Promise<ConceptoMovimiento> => {
  return fetchClient<ConceptoMovimiento>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
  fetch,
  fetchById,
  fetchActivos,
  create,
  edit,
  remove,
};
