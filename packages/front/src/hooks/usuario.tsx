import { create, edit, fetch, fetchById, editPermiso, remove } from '@/services/usuario';
import { Permiso, Query, Usuario } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetUsuariosQuery = (query: Query) => {
  return useQuery({
    queryKey: ['usuarios', query],
    queryFn: () => fetch(query),
    select: (data) => {
      return data.map((item: Usuario) => ({
        ...item,
        permiso: item.permiso?.nombre || null,
      }));
    },
  });
};

export const useGetUsuarioByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => fetchById(id),
  });
};

export const useCreateUsuarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-usuario'],
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};

export const useEditUsuarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['edit-usuario'],
    mutationFn: ({ id, data }: { id: number; data: Usuario }) => edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};



export const useEditPermisoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['edit-permiso'],
    mutationFn: ({ id, permisoId }: { id: number; permisoId: number }) =>
      editPermiso(id, permisoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });
};


export const useDeleteUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-usuario'],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => {
      console.error('Error en eliminación:', error);
    },
  });
};
