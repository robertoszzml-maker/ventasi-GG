import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config, Query } from "@/types";
import {
  fetch,
  fetchById,
  fetchByKey,
  fetchByModule,
  create,
  edit,
  remove,
} from "@/services/config";

export const useGetConfigsQuery = (query: Query) => {
  return useQuery({
    queryKey: ["configs", query],
    queryFn: () => fetch(query),
  });
};

export const useGetConfigByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["config", id],
    queryFn: () => fetchById(id),
  });
};

export const useGetConfigByKeyQuery = (clave: string) => {
  return useQuery({
    queryKey: ["config", "key", clave],
    queryFn: () => fetchByKey(clave),
    enabled: !!clave,
  });
};

export const useGetConfigsByModuleQuery = (modulo: string) => {
  return useQuery({
    queryKey: ["configs", "module", modulo],
    queryFn: () => fetchByModule(modulo),
    enabled: !!modulo,
  });
};

export const useCreateConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-config"],
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
  });
};

export const useEditConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["edit-config"],
    mutationFn: ({ id, data }: { id: number; data: Config }) => edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};

export const useDeleteConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-config"],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
    onError: (error) => {
      console.error("Error en eliminación:", error);
    },
  });
};
