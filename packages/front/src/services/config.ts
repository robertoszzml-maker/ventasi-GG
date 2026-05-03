import { Config, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'config';

const fetch = async (query: Query): Promise<Config[]> => {
  return fetchClient<Config[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Config> => {
  return fetchClient<Config>(`${basePath}/${id}`, 'GET');
};

const fetchByKey = async (clave: string): Promise<Config> => {
  return fetchClient<Config>(`${basePath}/clave/${clave}`, 'GET');
};

const fetchByModule = async (modulo: string): Promise<Config[]> => {
  return fetchClient<Config[]>(`${basePath}/modulo/${modulo}`, 'GET');
};

const create = async (body: Config): Promise<Config> => {
  return fetchClient<Config>(basePath, 'POST', body);
};

const edit = async (id: number, body: Config): Promise<Config> => {
  return fetchClient<Config>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
  fetch,
  fetchById,
  fetchByKey,
  fetchByModule,
  create,
  edit,
  remove
};
