import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    InsertEvent,
    DataSource,
} from 'typeorm';
import { Auditoria } from '@/modules/auditoria/entities/auditoria.entity';
import { RequestContext } from '@/core/request-context';
import { getTodayDateTime } from '@/helpers/date';

// Configuración para las tablas y columnas que quieres auditar
export const auditoriaConfig = {
    presupuesto: ['procesoGeneralId', 'descripcionCorta'],
    presupuesto_h: ['descripcion'],

    solcom: ['estadoId'],
    oferta: ['estadoId'],
    orden_compra: ['estadoId'],
    //TODO: PROBAR ESTO
};
@EventSubscriber()
export class AuditoriaSubscriber implements EntitySubscriberInterface {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    // Método para procesar los cambios y registrar en la tabla de auditoría
    private async auditChanges(
        tableName: string,
        columnas: string[],
        entidad: any,
        entidadAnterior: any,
        manager,
    ) {
        const auditoriaRepo = manager.getRepository(Auditoria);
        const userId = RequestContext.currentUser?.uid;
        const entityId = entidad?.id || entidadAnterior?.id;
        const fecha = getTodayDateTime();
        for (const column of columnas) {
            const oldVal = entidadAnterior?.[column];
            const newVal = entidad?.[column];

            if (!newVal || oldVal === newVal) continue;

            // Guardar los cambios en la tabla de auditoría
            await auditoriaRepo.save({
                tabla: tableName,
                columna: column,
                valorAnterior: oldVal,
                valorNuevo: newVal,
                registroId: entityId,
                usuarioId: userId,
                fecha,
            });
        }
    }

    // Método que se ejecuta después de insertar un registro
    async afterInsert(event: InsertEvent<any>) {
        const tableName = event.metadata.tableName;
        const columnas = auditoriaConfig[tableName];
        if (!columnas) return; // No hacer nada si no hay columnas configuradas para auditoría

        // Llamar a la función que audita los cambios
        await this.auditChanges(tableName, columnas, event.entity, null, event.manager);
    }

    // Método que se ejecuta después de actualizar un registro
    async beforeUpdate(event: UpdateEvent<any>) {
        const tableName = event.metadata.tableName;
        const columnas = auditoriaConfig[tableName];
        if (!columnas) return; // No hacer nada si no hay columnas configuradas para auditoría

        const entidad = event.entity;
        const entityId = entidad?.id;
        if (!entityId) return;

        // Proceder a auditar los cambios entre la entidad anterior y la actual
        await this.auditChanges(tableName, columnas, entidad, event.databaseEntity, event.manager);
    }
}
