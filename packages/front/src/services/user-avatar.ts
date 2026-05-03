import fetchClient from '@/lib/api-client';

export interface UserAvatar {
  id: number;
  usuarioId: number;
  archivoId: number;
  nombre: string;
  esPrincipal: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
  archivo?: {
    id: number;
    url: string;
    nombreArchivo: string;
  };
}

export const getUserAvatars = async (): Promise<UserAvatar[]> => {
  return fetchClient<UserAvatar[]>('user-avatars', 'GET');
};

export const getPrincipalAvatar = async (): Promise<UserAvatar | null> => {
  return fetchClient<UserAvatar>('user-avatars/principal', 'GET');
};

export const uploadAvatar = async (file: File, nombre?: string): Promise<UserAvatar> => {
  const formData = new FormData();
  formData.append('file', file);
  if (nombre) {
    formData.append('nombre', nombre);
  }
  
  return fetchClient<UserAvatar>('user-avatars', 'POST', formData as any);
};

export const setPrincipalAvatar = async (avatarId: number): Promise<UserAvatar> => {
  return fetchClient<UserAvatar>(`user-avatars/${avatarId}/principal`, 'PUT');
};

export const deleteAvatar = async (avatarId: number): Promise<{ message: string }> => {
  return fetchClient<{ message: string }>(`user-avatars/${avatarId}`, 'DELETE');
};

export const reorderAvatars = async (avatarIds: number[]): Promise<UserAvatar[]> => {
  return fetchClient<UserAvatar[]>('user-avatars/reorder', 'PUT', { avatarIds });
};
