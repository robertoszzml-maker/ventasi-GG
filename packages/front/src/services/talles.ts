import { Talle, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'talles';

const fetch = async (query: Query): Promise<Talle[]> => {
    return fetchClient<Talle[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Talle> => {
    return fetchClient<Talle>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Talle): Promise<Talle> => {
    return fetchClient<Talle>(basePath, 'POST', body);
};

const edit = async (id: number, body: Talle): Promise<Talle> => {
    return fetchClient<Talle>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
