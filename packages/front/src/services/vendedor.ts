import { Vendedor, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = 'vendedores';

const fetch = async (query: Query): Promise<Vendedor[]> =>
    fetchClient<Vendedor[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');

const fetchById = async (id: number): Promise<Vendedor> =>
    fetchClient<Vendedor>(`${basePath}/${id}`, 'GET');

const create = async (body: Vendedor): Promise<Vendedor> =>
    fetchClient<Vendedor>(basePath, 'POST', body);

const edit = async (id: number, body: Partial<Vendedor>): Promise<Vendedor> =>
    fetchClient<Vendedor>(`${basePath}/${id}`, 'PATCH', body as Vendedor);

const remove = async (id: number): Promise<void> =>
    fetchClient<void>(`${basePath}/${id}`, 'DELETE');

export { fetch, fetchById, create, edit, remove };
