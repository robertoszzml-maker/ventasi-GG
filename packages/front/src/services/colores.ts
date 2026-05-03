import { Color, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'colores';

const fetch = async (query: Query): Promise<Color[]> => {
    return fetchClient<Color[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Color> => {
    return fetchClient<Color>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Color): Promise<Color> => {
    return fetchClient<Color>(basePath, 'POST', body);
};

const edit = async (id: number, body: Color): Promise<Color> => {
    return fetchClient<Color>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
