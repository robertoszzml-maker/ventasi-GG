import { Auditoria } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'auditoria'

const fetchPresupuestoHistorial = async (registroId: number): Promise<Auditoria[]> => {
    return fetchClient<Auditoria[]>(`${basePath}/presupuesto/${registroId}/historial`, 'GET');
};

export {
    fetchPresupuestoHistorial
};
