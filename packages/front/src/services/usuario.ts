import fetchClient from '@/lib/api-client';
import { Query, Usuario } from '@/types';
import { generateQueryParams } from '@/utils/query-helper'

const basePath = 'usuario'
const fetch = async (query: Query): Promise<Usuario[]> => {

    return fetchClient<Usuario[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Usuario> => {
    return fetchClient<Usuario>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Usuario): Promise<Usuario> => {
    return fetchClient<Usuario>(basePath, 'POST', body);
};

const edit = async (id: number, body: Usuario): Promise<Usuario> => {
    return fetchClient<Usuario>(`${basePath}/${id}`, 'PATCH', body);
};

const editPermiso = async (id: number, permisoId: number): Promise<Usuario> => {
    return fetchClient<Usuario>(`${basePath}/${id}/permiso`, 'PATCH', { permisoId });
};
const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
    create,
    edit, fetch,
    fetchById, remove,
    editPermiso
};

