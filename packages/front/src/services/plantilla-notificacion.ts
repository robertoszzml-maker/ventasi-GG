import { PlantillaNotificacion, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'plantilla-notificacion';

const fetch = async (query: Query): Promise<PlantillaNotificacion[]> => {
    return fetchClient<PlantillaNotificacion[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<PlantillaNotificacion> => {
    return fetchClient<PlantillaNotificacion>(`${basePath}/${id}`, 'GET');
};

const create = async (body: PlantillaNotificacion): Promise<PlantillaNotificacion> => {
    return fetchClient<PlantillaNotificacion>(basePath, 'POST', body);
};

const edit = async (id: number, body: PlantillaNotificacion): Promise<PlantillaNotificacion> => {
    return fetchClient<PlantillaNotificacion>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
