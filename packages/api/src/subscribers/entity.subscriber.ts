// // src/common/entity.subscriber.ts
// import {
//     EntitySubscriberInterface,
//     EventSubscriber,
//     InsertEvent,
//     UpdateEvent,
//     Connection,
// } from 'typeorm';
// import { getUser } from '@/helpers/get-user';
// @EventSubscriber()
// export class EntitySubscriber implements EntitySubscriberInterface {
//     constructor(connection: Connection) {
//         connection.subscribers.push(this);
//     }
//     beforeInsert(event: InsertEvent<any>) {
//         const userId = getUser()?.uid;

//         const hasCreatedBy = event.metadata.columns.some(
//             (column) => column.propertyName === 'createdBy'
//         );
//         const hasUpdatedBy = event.metadata.columns.some(
//             (column) => column.propertyName === 'updatedBy'
//         );

//         if (hasCreatedBy) {
//             event.entity['createdBy'] = userId;
//         }
//         if (hasUpdatedBy) {
//             event.entity['updatedBy'] = userId;
//         }
//     }


//     beforeUpdate(event: UpdateEvent<any>) {

//         const userId = getUser()?.uid;
//         const hasUpdatedBy = event.metadata.columns.some(
//             (column) => column.propertyName === 'updatedBy'
//         );

//         if (event.entity && hasUpdatedBy) {
//             event.entity['updatedBy'] = userId;
//         }
//     }
// }

// ALTER TABLE tabla
// ADD COLUMN created_at TIMESTAMP NULL,
// ADD COLUMN created_by INT NULL,
// ADD COLUMN updated_at TIMESTAMP NULL,
// ADD COLUMN updated_by INT NULL,
// ADD COLUMN deleted_at TIMESTAMP NULL,
// ADD COLUMN deleted_by INT NULL;


import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    SoftRemoveEvent,
    DataSource,
} from 'typeorm';
import { RequestContext } from '../core/request-context';
import { getTodayDateTime } from '@/helpers/date';
@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }
    beforeInsert(event: InsertEvent<any>) {
        const userId = RequestContext.currentUser?.uid
        const hasCreatedBy = event.metadata.columns.some(
            (column) => column.propertyName === 'createdBy'
        );
        const hasUpdatedBy = event.metadata.columns.some(
            (column) => column.propertyName === 'updatedBy'
        );
        if (hasCreatedBy && userId) {
            event.entity['createdBy'] = userId;
            event.entity['createdAt'] = getTodayDateTime();

        }
        if (hasUpdatedBy && userId) {
            event.entity['updatedBy'] = userId;
            event.entity['updatedAt'] = getTodayDateTime();

        }
    }
    beforeUpdate(event: UpdateEvent<any>) {
        const userId = RequestContext.currentUser?.uid;
        const hasUpdatedBy = event.metadata.columns.some(
            (column) => column.propertyName === 'updatedBy'
        );
        if (event.entity && hasUpdatedBy && userId) {
            event.entity['updatedBy'] = userId;
            event.entity['updatedAt'] = getTodayDateTime();

        }
    }
    beforeSoftRemove(event: SoftRemoveEvent<any>) {
        const userId = RequestContext.currentUser?.uid;

        if (!event.entity || !userId) return;

        const repository = event.manager.getRepository(event.metadata.target);

        // Actualizamos usando update para evitar problemas con la instancia
        repository.update(event.entity.id, { deletedBy: userId });
    }
}

// // ALTER TABLE tabla
// // ADD COLUMN created_at TIMESTAMP NULL,
// // ADD COLUMN created_by INT NULL,
// // ADD COLUMN updated_at TIMESTAMP NULL,
// // ADD COLUMN updated_by INT NULL,
// // ADD COLUMN deleted_at TIMESTAMP NULL,
// // ADD COLUMN deleted_by INT NULL;