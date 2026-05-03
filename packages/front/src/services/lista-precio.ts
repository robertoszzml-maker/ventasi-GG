import { ListaPrecio, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'lista-precio';

const fetch = async (query: Query): Promise<ListaPrecio[]> => {
    return fetchClient<ListaPrecio[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<ListaPrecio> => {
    return fetchClient<ListaPrecio>(`${basePath}/${id}`, 'GET');
};

const create = async (body: ListaPrecio): Promise<ListaPrecio> => {
    return fetchClient<ListaPrecio>(basePath, 'POST', body);
};

const edit = async (id: number, body: Partial<ListaPrecio>): Promise<ListaPrecio> => {
    return fetchClient<ListaPrecio>(`${basePath}/${id}`, 'PATCH', body as ListaPrecio);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
