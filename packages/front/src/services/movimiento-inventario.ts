import { MovimientoInventario, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'movimientos-inventario';

const fetch = async (query: Query): Promise<MovimientoInventario[]> => {
  return fetchClient<MovimientoInventario[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<MovimientoInventario> => {
  return fetchClient<MovimientoInventario>(`${basePath}/${id}`, 'GET');
};

const create = async (body: MovimientoInventario): Promise<MovimientoInventario> => {
  return fetchClient<MovimientoInventario>(basePath, 'POST', body);
};

export { fetch, fetchById, create };
