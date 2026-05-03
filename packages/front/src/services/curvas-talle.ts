import { CurvaTalle, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'curvas-talle';

const fetch = async (query: Query): Promise<CurvaTalle[]> => {
    return fetchClient<CurvaTalle[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<CurvaTalle> => {
    return fetchClient<CurvaTalle>(`${basePath}/${id}`, 'GET');
};

const create = async (body: CurvaTalle): Promise<CurvaTalle> => {
    return fetchClient<CurvaTalle>(basePath, 'POST', body);
};

const edit = async (id: number, body: CurvaTalle): Promise<CurvaTalle> => {
    return fetchClient<CurvaTalle>(`${basePath}/${id}`, 'PATCH', body);
};

const updateTalles = async (id: number, talleIds: number[]): Promise<CurvaTalle> => {
    return fetchClient<CurvaTalle>(`${basePath}/${id}/talles`, 'PATCH', { talleIds });
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, updateTalles, remove };
