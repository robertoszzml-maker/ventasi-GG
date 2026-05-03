import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as permissionService from '@/services/permission';
import { CreatePermissionDto, UpdatePermissionDto } from '@/types/permission';

export const useGetPermissionsQuery = () => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: () => permissionService.fetch(),
    });
};

export const useGetPermissionByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['permission', id],
        queryFn: () => permissionService.fetchById(id),
        enabled: !!id,
    });
};

export const useCreatePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-permission'],
        mutationFn: (data: CreatePermissionDto) => permissionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
    });
};

export const useEditPermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-permission'],
        mutationFn: ({ id, data }: { id: number; data: UpdatePermissionDto }) =>
            permissionService.edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
    });
};

export const useDeletePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-permission'],
        mutationFn: (id: number) => permissionService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
    });
};
