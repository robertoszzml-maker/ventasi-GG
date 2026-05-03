import { GrillaArticulo, IngresoItem, UmbralVariante, BulkUmbralPayload } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'articulos';

const fetchGrilla = async (articuloId: number): Promise<GrillaArticulo> => {
    return fetchClient<GrillaArticulo>(`${basePath}/${articuloId}/grilla`, 'GET');
};

const registrarIngreso = async (articuloId: number, items: IngresoItem[]): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/ingresos`, 'POST', { items });
};

const ajustarCantidad = async (articuloId: number, varianteId: number, cantidad: string): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/variantes/${varianteId}`, 'PATCH', { cantidad });
};

const actualizarUmbrales = async (articuloId: number, varianteId: number, dto: UmbralVariante): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/variantes/${varianteId}/umbrales`, 'PATCH', dto);
};

const bulkUmbrales = async (dto: BulkUmbralPayload): Promise<GrillaArticulo> => {
    return fetchClient<GrillaArticulo>(`${basePath}/variantes/bulk-umbrales`, 'POST', dto);
};

const copiarUmbrales = async (articuloId: number, varianteId: number): Promise<GrillaArticulo> => {
    return fetchClient<GrillaArticulo>(`${basePath}/variantes/${varianteId}/copiar-umbrales`, 'POST');
};

const remove = async (articuloId: number, varianteId: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/variantes/${varianteId}`, 'DELETE');
};

const actualizarCodigoBarras = async (articuloId: number, varianteId: number, codigoBarras: string | null): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/variantes/${varianteId}/codigo-barras`, 'PATCH', { codigoBarras });
};

export { fetchGrilla, registrarIngreso, ajustarCantidad, actualizarUmbrales, bulkUmbrales, copiarUmbrales, remove, actualizarCodigoBarras };
