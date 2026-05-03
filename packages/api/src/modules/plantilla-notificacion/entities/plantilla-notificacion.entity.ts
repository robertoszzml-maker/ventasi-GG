import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';

@Entity('plantilla_notificacion')
export class PlantillaNotificacion extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    nombre: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    descripcion: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    asunto: string;

    @Column({ type: 'text', nullable: false })
    cuerpo: string;
}
