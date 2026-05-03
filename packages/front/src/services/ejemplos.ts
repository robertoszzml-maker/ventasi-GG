import { Ejemplo, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'ejemplos';

const fetch = async (query: Query): Promise<Ejemplo[]> => {
    return fetchClient<Ejemplo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Ejemplo> => {
    return fetchClient<Ejemplo>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Ejemplo): Promise<Ejemplo> => {
    return fetchClient<Ejemplo>(basePath, 'POST', body);
};

const edit = async (id: number, body: Ejemplo): Promise<Ejemplo> => {
    return fetchClient<Ejemplo>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
