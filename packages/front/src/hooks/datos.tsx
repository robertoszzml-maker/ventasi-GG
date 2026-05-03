import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dato, PaginationParam } from "@/types";
import {
  fetchDatos,
  fetchDatoById,
  createDato,
  editDato,
  deleteDato,
} from "@/services/datos";

export const useGetDatosQuery = (pagination: PaginationParam) => {
  return useQuery({
    queryKey: ["datos", pagination],
    queryFn: () => fetchDatos(pagination),
  });
};
export const useGetDatoByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["datos", id],
    queryFn: () => fetchDatoById(id),
  });
};
export const useCreateDatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-dato"], // TODO: Esto es boilerplate
    mutationFn: createDato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datos"] });
    },
  });
};
export const useEditDatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["edit-dato"],
    mutationFn: ({ id, data }: { id: number; data: Dato }) =>
      editDato(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datos"] });
    },
  });
};
export const useDeleteDatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-dato"],
    mutationFn: deleteDato,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["datos"] });
    },
    onError: (e) => {},
  });
};
