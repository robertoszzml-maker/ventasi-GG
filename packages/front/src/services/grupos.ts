import { Grupo, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'grupos';

const fetch = async (query: Query): Promise<Grupo[]> => {
    return fetchClient<Grupo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Grupo> => {
    return fetchClient<Grupo>(`${basePath}/${id}`, 'GET');
};

const fetchByFamiliaId = async (familiaId: number): Promise<Grupo[]> => {
    const query: Query = {
        pagination: { pageIndex: 0, pageSize: 100 },
        columnFilters: [{ id: 'familiaId', value: String(familiaId) }],
    };
    return fetchClient<Grupo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const create = async (body: Grupo): Promise<Grupo> => {
    return fetchClient<Grupo>(basePath, 'POST', body);
};

const edit = async (id: number, body: Grupo): Promise<Grupo> => {
    return fetchClient<Grupo>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, fetchByFamiliaId, create, edit, remove };
