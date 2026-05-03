import fetchClient from '@/lib/api-client';
import { Notificacion, Query } from '@/types';
import { generateQueryParams } from '@/utils/query-helper';
const basePath = 'notificacion'

const fetch = async (query: Query): Promise<Notificacion[]> => {
    return fetchClient<Notificacion[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Notificacion> => {
    return fetchClient<Notificacion>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Notificacion): Promise<Notificacion> => {
    return fetchClient<Notificacion>(basePath, 'POST', body);
};

const edit = async (id: number, body: Notificacion): Promise<Notificacion> => {
    return fetchClient<Notificacion>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
    create,
    edit, fetch,
    fetchById, remove
};

