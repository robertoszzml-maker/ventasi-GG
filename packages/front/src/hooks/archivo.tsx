import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Archivo, Query, } from '@/types';
import { fetch, fetchById, create, edit, remove, fetchFileById, fetchFiles } from '@/services/archivo';

// Hook para obtener la lista de archivos con filtros
export const useGetArchivosQuery = (query: Query) => {
    return useQuery({
        queryKey: ['archivos', query],
        queryFn: () => fetch(query),
    });
};

// Hook para obtener un archivo por su ID
export const useGetArchivoByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ['archivo', id],
        queryFn: () => fetchById(id),
        enabled: Boolean(id),

    });
};


export const useDownloadArchivosQuery = (query: {
    id: number[]
}, options?: Record<string, unknown>) => {
    // TODO: Revisar el tipado
    return useQuery({
        queryKey: ['archivos', query],
        queryFn: () => fetchFiles(query),
        enabled: query.id.length > 0,
        ...options
    });
};
export const useDownloadArchivoByIdQuery = (id?: number, options?: Record<string, unknown>) => {
    // TODO: Revisar el tipado
    return useQuery({
        queryKey: ['archivo', id],
        queryFn: () => fetchFileById(id || 0),
        enabled: Boolean(id),
        ...options
    });
};

// Hook para crear un nuevo archivo
export const useCreateArchivoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-archivo'],
        mutationFn: ({ data, file }: { data: Archivo; file?: File }) => create(data, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['archivos'] });
            // queryClient.invalidateQueries({ queryKey: ['mensajes'] }); //TODO: Verificar a futuro si hay mejor manera
        },
    });
};

// Hook para editar un archivo existente
export const useEditArchivoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['edit-archivo'],
        mutationFn: ({ id, data, file }: { id: number; data: Archivo, file?: File }) => edit(id, data, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['archivos'] });
        },
    });
};

// Hook para eliminar un archivo
export const useDeleteArchivoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-archivo'],
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['archivos'] });
        },
        onError: (error) => {
            console.error('Error en eliminación:', error);
        },
    });
};

export const useDownloadArchivoByIdMutation = () => {
    // TODO: Revisar el tipado
    return useMutation({
        mutationKey: ['archivo'],
        mutationFn: ({ id }: { id: number }) => fetchFileById(id || 0),

    });
};
