import { Cobro, CreateCobroPayload } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'cobros';

const fetchPorVenta = async (ventaId: number): Promise<{ cobros: Cobro[]; sumaMontos: string }> => {
  return fetchClient<{ cobros: Cobro[]; sumaMontos: string }>(`${basePath}/venta/${ventaId}`, 'GET');
};

const create = async (body: CreateCobroPayload): Promise<Cobro> => {
  return fetchClient<Cobro>(basePath, 'POST', body as unknown as Cobro);
};

const remove = async (id: number): Promise<Cobro> => {
  return fetchClient<Cobro>(`${basePath}/${id}`, 'DELETE');
};

export { fetchPorVenta, create, remove };
