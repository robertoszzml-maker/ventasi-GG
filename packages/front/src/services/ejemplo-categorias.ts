import { EjemploCategoria, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'ejemplo-categorias';

const fetch = async (query: Query): Promise<EjemploCategoria[]> => {
    return fetchClient<EjemploCategoria[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<EjemploCategoria> => {
    return fetchClient<EjemploCategoria>(`${basePath}/${id}`, 'GET');
};

const create = async (body: EjemploCategoria): Promise<EjemploCategoria> => {
    return fetchClient<EjemploCategoria>(basePath, 'POST', body);
};

const edit = async (id: number, body: EjemploCategoria): Promise<EjemploCategoria> => {
    return fetchClient<EjemploCategoria>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
