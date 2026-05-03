import { VarianteEtiqueta } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'articulos';

export const fetchVariantesParaEtiquetas = async (articuloIds: number[]): Promise<VarianteEtiqueta[]> => {
    if (!articuloIds.length) return [];
    return fetchClient<VarianteEtiqueta[]>(
        `${basePath}/variantes-para-etiquetas?articuloIds=${articuloIds.join(',')}`,
        'GET',
    );
};
