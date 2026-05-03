import { RazonNoCompra, SubRazonNoCompra } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'razones-no-compra';

const fetchTodas = async (): Promise<RazonNoCompra[]> => {
    return fetchClient<RazonNoCompra[]>(basePath, 'GET');
};

const fetchById = async (id: number): Promise<RazonNoCompra> => {
    return fetchClient<RazonNoCompra>(`${basePath}/${id}`, 'GET');
};

const fetchActivas = async (): Promise<RazonNoCompra[]> => {
    return fetchClient<RazonNoCompra[]>(`${basePath}/activas`, 'GET');
};

const create = async (body: Partial<RazonNoCompra>): Promise<RazonNoCompra> => {
    return fetchClient<RazonNoCompra>(basePath, 'POST', body);
};

const edit = async (id: number, body: Partial<RazonNoCompra>): Promise<RazonNoCompra> => {
    return fetchClient<RazonNoCompra>(`${basePath}/${id}`, 'PATCH', body);
};

const createSubRazon = async (razonId: number, body: Partial<SubRazonNoCompra>): Promise<SubRazonNoCompra> => {
    return fetchClient<SubRazonNoCompra>(`${basePath}/${razonId}/sub-razones`, 'POST', body);
};

const editSubRazon = async (id: number, body: Partial<SubRazonNoCompra>): Promise<SubRazonNoCompra> => {
    return fetchClient<SubRazonNoCompra>(`${basePath}/sub-razones/${id}`, 'PATCH', body);
};

export { fetchTodas, fetchById, fetchActivas, create, edit, createSubRazon, editSubRazon };
