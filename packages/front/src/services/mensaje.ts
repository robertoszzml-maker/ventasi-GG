import fetchClient from '@/lib/api-client';
import { Mensaje, Query } from '@/types';
import { generateQueryParams } from '@/utils/query-helper';
const basePath = 'mensaje'

const fetch = async (query: Query): Promise<Mensaje[]> => {
    return fetchClient<Mensaje[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Mensaje> => {
    return fetchClient<Mensaje>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Mensaje): Promise<Mensaje> => {
    return fetchClient<Mensaje>(basePath, 'POST', body);
};

const edit = async (id: number, body: Mensaje): Promise<Mensaje> => {
    return fetchClient<Mensaje>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
    create,
    edit, fetch,
    fetchById, remove
};

