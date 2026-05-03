import { Articulo, ArticuloAncla, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'articulos';

const fetch = async (query: Query): Promise<Articulo[]> => {
    return fetchClient<Articulo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Articulo> => {
    return fetchClient<Articulo>(`${basePath}/${id}`, 'GET');
};

const create = async (body: Articulo): Promise<Articulo> => {
    return fetchClient<Articulo>(basePath, 'POST', body);
};

const edit = async (id: number, body: Articulo): Promise<Articulo> => {
    return fetchClient<Articulo>(`${basePath}/${id}`, 'PATCH', body);
};

const addTalle = async (id: number, body: { talleId: number; orden?: number }): Promise<Articulo> => {
    return fetchClient<Articulo>(`${basePath}/${id}/talles`, 'POST', body);
};

const addColor = async (id: number, body: { colorId: number; orden?: number }): Promise<Articulo> => {
    return fetchClient<Articulo>(`${basePath}/${id}/colores`, 'POST', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

const fetchDashboardAnclas = async (): Promise<ArticuloAncla[]> => {
    return fetchClient<ArticuloAncla[]>(`${basePath}/dashboard-anclas`, 'GET');
};

export { fetch, fetchById, create, edit, addTalle, addColor, remove, fetchDashboardAnclas };
