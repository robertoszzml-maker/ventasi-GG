import { MedioPago, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'medios-pago';

const fetch = async (query: Query): Promise<MedioPago[]> => {
  return fetchClient<MedioPago[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchActivos = async (): Promise<MedioPago[]> => {
  return fetchClient<MedioPago[]>(`${basePath}/activos`, 'GET');
};

const fetchPorCodigo = async (codigo: string): Promise<MedioPago> => {
  return fetchClient<MedioPago>(`${basePath}/codigo/${codigo.toUpperCase()}`, 'GET');
};

const create = async (body: Partial<MedioPago>): Promise<MedioPago> => {
  return fetchClient<MedioPago>(basePath, 'POST', body as MedioPago);
};

const edit = async (id: number, body: Partial<MedioPago>): Promise<MedioPago> => {
  return fetchClient<MedioPago>(`${basePath}/${id}`, 'PATCH', body as MedioPago);
};

const remove = async (id: number): Promise<MedioPago> => {
  return fetchClient<MedioPago>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchActivos, fetchPorCodigo, create, edit, remove };
