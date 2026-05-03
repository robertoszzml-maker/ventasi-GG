import { ArticuloPrecio, AplicarPorcentajePayload, UpdatePrecioItem } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'articulo-precio';

const fetchPorLista = async (listaPrecioId: number): Promise<ArticuloPrecio[]> => {
    return fetchClient<ArticuloPrecio[]>(`${basePath}/por-lista/${listaPrecioId}`, 'GET');
};

const fetchPorArticulo = async (articuloId: number): Promise<ArticuloPrecio[]> => {
    return fetchClient<ArticuloPrecio[]>(`${basePath}/por-articulo/${articuloId}`, 'GET');
};

const edit = async (id: number, body: { precio: number }): Promise<ArticuloPrecio> => {
    return fetchClient<ArticuloPrecio>(`${basePath}/${id}`, 'PATCH', body as unknown as ArticuloPrecio);
};

const updateLote = async (items: UpdatePrecioItem[]): Promise<{ afectados: number }> => {
    return fetchClient<{ afectados: number }>(`${basePath}/lote/bulk`, 'PATCH', { items } as unknown as { afectados: number });
};

const aplicarPorcentaje = async (body: AplicarPorcentajePayload): Promise<{ afectados: number }> => {
    return fetchClient<{ afectados: number }>(`${basePath}/aplicar-porcentaje/bulk`, 'PATCH', body as unknown as { afectados: number });
};

export { fetchPorLista, fetchPorArticulo, edit, updateLote, aplicarPorcentaje };
