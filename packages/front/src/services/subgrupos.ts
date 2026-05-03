import { Subgrupo, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'subgrupos';

const fetch = async (query: Query): Promise<Subgrupo[]> => {
    return fetchClient<Subgrupo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Subgrupo> => {
    return fetchClient<Subgrupo>(`${basePath}/${id}`, 'GET');
};

const fetchByGrupoId = async (grupoId: number): Promise<Subgrupo[]> => {
    const query: Query = {
        pagination: { pageIndex: 0, pageSize: 100 },
        columnFilters: [{ id: 'grupoId', value: String(grupoId) }],
    };
    return fetchClient<Subgrupo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const create = async (body: Subgrupo): Promise<Subgrupo> => {
    return fetchClient<Subgrupo>(basePath, 'POST', body);
};

const edit = async (id: number, body: Subgrupo): Promise<Subgrupo> => {
    return fetchClient<Subgrupo>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, fetchByGrupoId, create, edit, remove };
