import { Venta, Comprobante, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'ventas';

const fetch = async (query: Query): Promise<Venta[]> =>
    fetchClient<Venta[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');

const fetchById = async (id: number): Promise<Venta> =>
    fetchClient<Venta>(`${basePath}/${id}`, 'GET');

const create = async (body: Venta): Promise<Venta> =>
    fetchClient<Venta>(basePath, 'POST', body);

const guardar = async (id: number, body: Venta): Promise<Venta> =>
    fetchClient<Venta>(`${basePath}/${id}`, 'PATCH', body);

const confirmar = async (id: number): Promise<Venta> =>
    fetchClient<Venta>(`${basePath}/${id}/confirmar`, 'POST');

const emitirManual = async (id: number, formato?: string): Promise<Comprobante> =>
    fetchClient<Comprobante>(`${basePath}/${id}/emitir-manual${formato ? `?formato=${formato}` : ''}`, 'POST');

const emitirFiscal = async (id: number, formato?: string): Promise<Comprobante> =>
    fetchClient<Comprobante>(`${basePath}/${id}/emitir-fiscal${formato ? `?formato=${formato}` : ''}`, 'POST');

const reintentar = async (id: number): Promise<Comprobante> =>
    fetchClient<Comprobante>(`${basePath}/${id}/reintentar`, 'POST');

const anular = async (id: number): Promise<Venta> =>
    fetchClient<Venta>(`${basePath}/${id}/anular`, 'DELETE');

export type VentaRawQuery = {
    limit?: number;
    skip?: number;
    filter?: string;
    order?: string;
};

const fetchRaw = async (query: VentaRawQuery): Promise<Venta[]> => {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    if (query.skip !== undefined) params.set('skip', String(query.skip));
    if (query.filter) params.set('filter', query.filter);
    if (query.order) params.set('order', query.order);
    return fetchClient<Venta[]>(`${basePath}?${params.toString()}`, 'GET');
};

export { fetch, fetchById, fetchRaw, create, guardar, confirmar, emitirManual, emitirFiscal, reintentar, anular };
