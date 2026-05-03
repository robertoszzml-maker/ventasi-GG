import { SesionCaja, AbrirCajaDto, CerrarCajaDto } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'sesiones-caja';

export type SesionCajaQuery = {
  limit?: number;
  skip?: number;
  filter?: string;
  order?: string;
};

const getSesionActiva = async (): Promise<SesionCaja | null> => {
  return fetchClient<SesionCaja | null>(`${basePath}/activa`, 'GET');
};

const fetch = async (query: SesionCajaQuery): Promise<SesionCaja[]> => {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.skip !== undefined) params.set('skip', String(query.skip));
  if (query.filter) params.set('filter', query.filter);
  if (query.order) params.set('order', query.order);
  return fetchClient<SesionCaja[]>(`${basePath}?${params.toString()}`, 'GET');
};

const fetchById = async (id: number): Promise<SesionCaja> => {
  return fetchClient<SesionCaja>(`${basePath}/${id}`, 'GET');
};

const abrirCaja = async (body: AbrirCajaDto): Promise<SesionCaja> => {
  return fetchClient<SesionCaja>(`${basePath}/abrir`, 'POST', body);
};

const cerrarCaja = async (id: number, body: CerrarCajaDto): Promise<SesionCaja> => {
  return fetchClient<SesionCaja>(`${basePath}/${id}/cerrar`, 'POST', body);
};

export {
  getSesionActiva,
  fetch,
  fetchById,
  abrirCaja,
  cerrarCaja,
};
