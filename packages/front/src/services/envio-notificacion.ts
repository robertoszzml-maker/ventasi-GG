import { EnvioNotificacion, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams, prepareFilterValue } from '@/utils/query-helper';
import { ColumnFiltersState } from '@tanstack/react-table';

const basePath = 'envio-notificacion';

type EnviarPayload = {
    plantillaId: number;
    canal: 'email' | 'whatsapp';
    modelo: string;
    filtros?: Record<string, unknown>;
    clienteIds?: number[];
    tiposContacto?: string[];
    from?: string;
    emailActivo?: boolean;
    emailTest?: string;
};

type EnviarResult = {
    total: number;    // clientes notificados
    registros: number; // registros creados
};

export type PreviewItem = {
    clienteId: number;
    nombre: string;
    email: string;
    emailPagoProveedores: string | null;
    telefono: string;
    telefonoPagoProveedores: string | null;
    cantidadEntidades: number;
};

const fetch = async (query: Query): Promise<EnvioNotificacion[]> => {
    return fetchClient<EnvioNotificacion[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<EnvioNotificacion> => {
    return fetchClient<EnvioNotificacion>(`${basePath}/${id}`, 'GET');
};

const toFiltros = (columnFilters: ColumnFiltersState): Record<string, unknown> | undefined => {
    if (!columnFilters.length) return undefined;
    return columnFilters.reduce((acc, f) => {
        acc[f.id] = prepareFilterValue(f.value);
        return acc;
    }, {} as Record<string, unknown>);
};

const preview = async (
    modelo: string,
    columnFilters: ColumnFiltersState,
): Promise<PreviewItem[]> => {
    return fetchClient<PreviewItem[]>(`${basePath}/preview`, 'POST', { modelo, filtros: toFiltros(columnFilters) } as any);
};

const enviar = async (
    plantillaId: number,
    canal: 'email' | 'whatsapp',
    modelo: string,
    columnFilters: ColumnFiltersState,
    clienteIds?: number[],
    tiposContacto?: string[],
    from?: string,
    emailActivo?: boolean,
    emailTest?: string,
): Promise<EnviarResult> => {
    const payload: EnviarPayload = { plantillaId, canal, modelo, filtros: toFiltros(columnFilters), clienteIds, tiposContacto, from, emailActivo, emailTest };
    return fetchClient<EnviarResult>(`${basePath}/enviar`, 'POST', payload as any);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export { fetch, fetchById, preview, enviar, remove };
