import { Cliente, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'clientes';

const fetch = async (query: Query): Promise<Cliente[]> => {
  return fetchClient<Cliente[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Cliente> => {
  return fetchClient<Cliente>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Cliente): Promise<Cliente> => {
  return fetchClient<Cliente>(basePath, 'POST', body);
};

const edit = async (id: number, body: Cliente): Promise<Cliente> => {
  return fetchClient<Cliente>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

const fetchPadron = async (cuit: string): Promise<unknown> => {
  return fetchClient<unknown>(`${basePath}/padron/${cuit}`, 'GET');
};

export { fetch, fetchById, create, edit, remove, fetchPadron };
