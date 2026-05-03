import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Query } from "@/types";
import { ColumnFiltersState } from "@tanstack/react-table";
import {
  fetch,
  fetchById,
  preview,
  enviar,
  remove,
} from "@/services/envio-notificacion";

export const useGetEnviosNotificacionQuery = (query: Query) => {
  return useQuery({
    queryKey: ["envios-notificacion", query],
    queryFn: () => fetch(query),
  });
};

export const useGetEnvioNotificacionByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["envio-notificacion", id],
    queryFn: () => fetchById(id),
    enabled: Boolean(id),
  });
};

export const usePreviewNotificacionQuery = (
  modelo: string,
  columnFilters: ColumnFiltersState,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ["preview-notificacion", modelo, columnFilters],
    queryFn: () => preview(modelo, columnFilters),
    enabled,
  });
};

export const useEnviarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["enviar-notificacion"],
    mutationFn: ({
      plantillaId,
      canal,
      modelo,
      columnFilters,
      clienteIds,
      tiposContacto,
      from,
      emailActivo,
      emailTest,
    }: {
      plantillaId: number;
      canal: "email" | "whatsapp";
      modelo: string;
      columnFilters: ColumnFiltersState;
      clienteIds?: number[];
      tiposContacto?: string[];
      from?: string;
      emailActivo?: boolean;
      emailTest?: string;
    }) =>
      enviar(
        plantillaId,
        canal,
        modelo,
        columnFilters,
        clienteIds,
        tiposContacto,
        from,
        emailActivo,
        emailTest,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["envios-notificacion"] });
    },
  });
};

export const useDeleteEnvioNotificacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-envio-notificacion"],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["envios-notificacion"] });
    },
  });
};

// TODO: REVISAR ESTO POR LAS DUDAS, NO ME CIERRA MUCHO EL PREVIEW  Y SI ESTA UNIFICADO
