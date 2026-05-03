import { DashboardConversion, MetricasDia, Visita } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'visitas';

const crear = async (body: { tipoVisitante: string; caracteristicaIds?: number[]; clienteId?: number }): Promise<Visita> => {
    return fetchClient<Visita>(basePath, 'POST', body);
};

const resolverCompra = async (id: number, movimientoId: number): Promise<Visita> => {
    return fetchClient<Visita>(`${basePath}/${id}/compra`, 'PATCH', { movimientoId });
};

const resolverNoCompra = async (id: number, body: {
    razonId: number;
    subRazonId?: number;
    articuloId?: number;
    clienteId?: number;
    observaciones?: string;
}): Promise<Visita> => {
    return fetchClient<Visita>(`${basePath}/${id}/no-compra`, 'PATCH', body);
};

const fetchPendientes = async (): Promise<Visita[]> => {
    return fetchClient<Visita[]>(`${basePath}/pendientes`, 'GET');
};

const fetchMetricasDia = async (): Promise<MetricasDia> => {
    return fetchClient<MetricasDia>(`${basePath}/metricas-dia`, 'GET');
};

const fetchDashboard = async (periodo: 'hoy' | 'semana' | 'mes'): Promise<DashboardConversion> => {
    return fetchClient<DashboardConversion>(`${basePath}/dashboard?periodo=${periodo}`, 'GET');
};

export { crear, resolverCompra, resolverNoCompra, fetchPendientes, fetchMetricasDia, fetchDashboard };
