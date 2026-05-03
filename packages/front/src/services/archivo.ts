import { Archivo, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper'
const basePath = 'archivo'
const fetch = async (query: Query): Promise<Archivo[]> => {

    return fetchClient<Archivo[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<Archivo> => {
    return fetchClient<Archivo>(`${basePath}/${id}`, 'GET');
};

const fetchFileById = async (id: number): Promise<Blob> => {
    return fetchClient(`${basePath}/file/${id}`, 'GET');
};

const fetchFiles = async (query: {
    id: number[]
}): Promise<Blob[]> => {

    const queryString = query.id.map((id) => `id=${id}`).join('&');

    return fetchClient(`${basePath}/file?${queryString}`, 'GET');
};
const create = async (body: Archivo, file?: File): Promise<Archivo> => {
    if (file) {
        const formData = new FormData();

        // Agrega el archivo al FormData
        formData.append('file', file);

        // Agrega los demás campos del cuerpo
        Object.keys(body).forEach((key) => {
            const value = body[key as keyof Archivo];
            formData.append(key, String(value));
        });

        // Envía la solicitud sin configurar manualmente el Content-Type
        return fetchClient<Archivo>(basePath, 'POST', formData);
    }


    // Si no hay archivo, envía el cuerpo como JSON
    return fetchClient<Archivo>(basePath, 'POST', body);
};
const edit = async (id: number, body: Archivo, file?: File): Promise<Archivo> => {
    const formData = new FormData();

    if (file) {
        formData.append('file', file);
    }

    Object.keys(body).forEach((key) => {
        const value = body[key as keyof Archivo];
        formData.append(key, String(value));
    });

    return fetchClient<Archivo>(`${basePath}/${id}`, 'PATCH', formData);
};
const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
    fetch,
    fetchById,
    create,
    edit,
    remove,
    fetchFiles,
    fetchFileById
};
