import { Articulo, GrillaArticulo } from '@/types';
import fetchClient from '@/lib/api-client';

export type ArticuloVentaResult = Articulo & { precioVenta?: number };

export type BarcodeVarianteResult = {
  varianteId: number;
  articuloId: number;
  talleId: number;
  colorId: number;
  talleCodigo: string;
  colorCodigo: string;
  articuloNombre: string;
  articuloSku: string;
  precio: number | null;
};

const buscarArticulos = async (search: string, listaPrecioId?: number): Promise<ArticuloVentaResult[]> => {
    const params = new URLSearchParams({ search, limit: '20', skip: '0' });
    if (listaPrecioId) params.set('listaPrecioId', String(listaPrecioId));
    return fetchClient<ArticuloVentaResult[]>(`articulos?${params.toString()}`, 'GET');
};

const fetchGrillaConPrecio = async (articuloId: number, listaPrecioId?: number): Promise<GrillaArticulo> => {
    const params = listaPrecioId ? `?listaPrecioId=${listaPrecioId}` : '';
    return fetchClient<GrillaArticulo>(`articulos/${articuloId}/grilla${params}`, 'GET');
};

const buscarVariantePorBarcode = async (barcode: string, listaPrecioId?: number): Promise<BarcodeVarianteResult> => {
    const params = new URLSearchParams({ barcode });
    if (listaPrecioId) params.set('listaPrecioId', String(listaPrecioId));
    return fetchClient<BarcodeVarianteResult>(`articulos/variantes/buscar-barcode?${params.toString()}`, 'GET');
};

export { buscarArticulos, fetchGrillaConPrecio, buscarVariantePorBarcode };
