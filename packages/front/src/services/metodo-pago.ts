import { MetodoPago, CuotaMetodoPago, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'metodos-pago';

const fetch = async (query: Query): Promise<MetodoPago[]> =>
    fetchClient<MetodoPago[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');

const fetchById = async (id: number): Promise<MetodoPago> =>
    fetchClient<MetodoPago>(`${basePath}/${id}`, 'GET');

const create = async (body: MetodoPago): Promise<MetodoPago> =>
    fetchClient<MetodoPago>(basePath, 'POST', body);

const edit = async (id: number, body: Partial<MetodoPago>): Promise<MetodoPago> =>
    fetchClient<MetodoPago>(`${basePath}/${id}`, 'PATCH', body as MetodoPago);

const remove = async (id: number): Promise<void> =>
    fetchClient<void>(`${basePath}/${id}`, 'DELETE');

const addCuota = async (metodoPagoId: number, body: Partial<CuotaMetodoPago>): Promise<CuotaMetodoPago> =>
    fetchClient<CuotaMetodoPago>(`${basePath}/${metodoPagoId}/cuotas`, 'POST', body as CuotaMetodoPago);

const editCuota = async (cuotaId: number, body: Partial<CuotaMetodoPago>): Promise<CuotaMetodoPago> =>
    fetchClient<CuotaMetodoPago>(`${basePath}/cuotas/${cuotaId}`, 'PATCH', body as CuotaMetodoPago);

const removeCuota = async (cuotaId: number): Promise<CuotaMetodoPago> =>
    fetchClient<CuotaMetodoPago>(`${basePath}/cuotas/${cuotaId}`, 'DELETE');

export { fetch, fetchById, create, edit, remove, addCuota, editCuota, removeCuota };
