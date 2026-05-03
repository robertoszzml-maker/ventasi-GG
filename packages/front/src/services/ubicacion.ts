import { Ubicacion, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'ubicaciones';

const fetch = async (query: Query): Promise<Ubicacion[]> => {
  return fetchClient<Ubicacion[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Ubicacion> => {
  return fetchClient<Ubicacion>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Ubicacion): Promise<Ubicacion> => {
  return fetchClient<Ubicacion>(basePath, 'POST', body);
};

const edit = async (id: number, body: Ubicacion): Promise<Ubicacion> => {
  return fetchClient<Ubicacion>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
