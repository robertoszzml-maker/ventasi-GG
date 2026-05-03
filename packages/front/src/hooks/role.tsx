"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as roleService from "@/services/role";
import { Role } from "@/types/permission";
import { Query } from "@/types";

export const useGetRolesQuery = (query: Query) => {
  return useQuery({
    queryKey: ["roles", query],
    queryFn: () => roleService.fetch(query),
  });
};

export const useGetRoleByIdQuery = (id: number | null) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => roleService.fetchById(id!),
    enabled: !!id && id > 0,
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Role>) => roleService.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Role> }) =>
      roleService.edit(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role"] });
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
