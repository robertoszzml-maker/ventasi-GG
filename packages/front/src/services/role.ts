import { Permiso, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper'
const basePath = 'role'
const fetch = async (query: Query): Promise<Permiso[]> => {
    return fetchClient<Permiso[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Permiso> => {
    return fetchClient<Permiso>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Permiso): Promise<Permiso> => {
    return fetchClient<Permiso>(basePath, 'POST', body);
};

const edit = async (id: number, body: Permiso): Promise<Permiso> => {
    return fetchClient<Permiso>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
    fetch,
    fetchById,
    create,
    edit,
    remove
};
