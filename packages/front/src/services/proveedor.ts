import { Proveedor, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'proveedores';

const fetch = async (query: Query): Promise<Proveedor[]> => {
  return fetchClient<Proveedor[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Proveedor> => {
  return fetchClient<Proveedor>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Proveedor): Promise<Proveedor> => {
  return fetchClient<Proveedor>(basePath, 'POST', body);
};

const edit = async (id: number, body: Proveedor): Promise<Proveedor> => {
  return fetchClient<Proveedor>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
