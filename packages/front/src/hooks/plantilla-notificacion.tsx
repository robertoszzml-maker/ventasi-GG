import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlantillaNotificacion, Query } from "@/types";
import {
  fetch,
  fetchById,
  create,
  edit,
  remove,
} from "@/services/plantilla-notificacion";

export const useGetPlantillasNotificacionQuery = (query: Query) => {
  return useQuery({
    queryKey: ["plantillas-notificacion", query],
    queryFn: () => fetch(query),
  });
};

export const useGetPlantillaNotificacionByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["plantilla-notificacion", id],
    queryFn: () => fetchById(id),
    enabled: Boolean(id),
  });
};

export const useCreatePlantillaNotificacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-plantilla-notificacion"],
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas-notificacion"] });
    },
  });
};

export const useEditPlantillaNotificacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["edit-plantilla-notificacion"],
    mutationFn: ({ id, data }: { id: number; data: PlantillaNotificacion }) =>
      edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas-notificacion"] });
    },
  });
};

export const useDeletePlantillaNotificacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-plantilla-notificacion"],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas-notificacion"] });
    },
  });
};
