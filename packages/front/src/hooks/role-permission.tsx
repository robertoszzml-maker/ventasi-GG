import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as rolePermissionService from '@/services/role-permission';

export const useGetRolePermissionsQuery = () => {
    return useQuery({
        queryKey: ['role-permissions'],
        queryFn: () => rolePermissionService.fetch(),
    });
};

export const useGetRolePermissionsByRoleQuery = (roleId: number | null) => {
    return useQuery({
        queryKey: ['role-permissions', roleId],
        queryFn: () => rolePermissionService.fetchByRole(roleId!),
        enabled: !!roleId && roleId > 0,
    });
};

export const useCreateRolePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-role-permission'],
        mutationFn: rolePermissionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        },
    });
};

export const useSetRolePermissionsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['set-role-permissions'],
        mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
            rolePermissionService.setRolePermissions(roleId, permissionIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
            queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] });
        },
    });
};

export const useDeleteRolePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-role-permission'],
        mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
            rolePermissionService.remove(roleId, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        },
    });
};
