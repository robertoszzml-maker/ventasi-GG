import { Permission, CreatePermissionDto, UpdatePermissionDto } from '@/types/permission';
import fetchClient from '@/lib/api-client';

const basePath = 'permission';

const fetch = async (): Promise<Permission[]> => {
  return fetchClient<Permission[]>(basePath, 'GET');
};

const fetchById = async (id: number): Promise<Permission> => {
  return fetchClient<Permission>(`${basePath}/${id}`, 'GET');
};

const create = async (body: CreatePermissionDto): Promise<Permission> => {
  return fetchClient<Permission>(basePath, 'POST', body);
};

const edit = async (id: number, body: UpdatePermissionDto): Promise<Permission> => {
  return fetchClient<Permission>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, create, edit, remove };
