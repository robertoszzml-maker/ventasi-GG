import { CaracteristicaVisitante, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'caracteristicas-visitante';

const fetch = async (query: Query): Promise<CaracteristicaVisitante[]> => {
    return fetchClient<CaracteristicaVisitante[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<CaracteristicaVisitante> => {
    return fetchClient<CaracteristicaVisitante>(`${basePath}/${id}`, 'GET');
};

const fetchActivas = async (): Promise<CaracteristicaVisitante[]> => {
    return fetchClient<CaracteristicaVisitante[]>(`${basePath}/activas`, 'GET');
};

const create = async (body: CaracteristicaVisitante): Promise<CaracteristicaVisitante> => {
    return fetchClient<CaracteristicaVisitante>(basePath, 'POST', body);
};

const edit = async (id: number, body: Partial<CaracteristicaVisitante>): Promise<CaracteristicaVisitante> => {
    return fetchClient<CaracteristicaVisitante>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, fetchActivas, create, edit, remove };
