import { CurvaColor, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'curvas-color';

const fetch = async (query: Query): Promise<CurvaColor[]> => {
    return fetchClient<CurvaColor[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<CurvaColor> => {
    return fetchClient<CurvaColor>(`${basePath}/${id}`, 'GET');
};

const create = async (body: CurvaColor): Promise<CurvaColor> => {
    return fetchClient<CurvaColor>(basePath, 'POST', body);
};

const edit = async (id: number, body: CurvaColor): Promise<CurvaColor> => {
    return fetchClient<CurvaColor>(`${basePath}/${id}`, 'PATCH', body);
};

const updateColores = async (id: number, colorIds: number[]): Promise<CurvaColor> => {
    return fetchClient<CurvaColor>(`${basePath}/${id}/colores`, 'PATCH', { colorIds });
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, updateColores, remove };
