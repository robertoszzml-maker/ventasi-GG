import { Familia, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'familias';

const fetch = async (query: Query): Promise<Familia[]> => {
    return fetchClient<Familia[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Familia> => {
    return fetchClient<Familia>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Familia): Promise<Familia> => {
    return fetchClient<Familia>(basePath, 'POST', body);
};

const edit = async (id: number, body: Familia): Promise<Familia> => {
    return fetchClient<Familia>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
