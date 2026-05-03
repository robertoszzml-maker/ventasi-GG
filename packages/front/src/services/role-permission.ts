import { RolePermission, CreateRolePermissionDto, SetRolePermissionsDto } from '@/types/permission';
import fetchClient from '@/lib/api-client';

const basePath = 'role-permission';

const fetch = async (): Promise<RolePermission[]> => {
  return fetchClient<RolePermission[]>(basePath, 'GET');
};

const fetchByRole = async (roleId: number): Promise<RolePermission[]> => {
  return fetchClient<RolePermission[]>(`${basePath}/role/${roleId}`, 'GET');
};

const create = async (body: CreateRolePermissionDto): Promise<RolePermission> => {
  return fetchClient<RolePermission>(basePath, 'POST', body);
};

const setRolePermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
  return fetchClient<void>(`${basePath}/role/${roleId}`, 'PUT', { roleId, permissionIds });
};

const remove = async (roleId: number, permissionId: number): Promise<void> => {
  return fetchClient<void>(`${basePath}/${roleId}/${permissionId}`, 'DELETE');
};

export { fetch, fetchByRole, create, setRolePermissions, remove };
