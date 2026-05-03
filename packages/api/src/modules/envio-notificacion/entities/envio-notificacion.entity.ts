import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { PlantillaNotificacion } from '@/modules/plantilla-notificacion/entities/plantilla-notificacion.entity';

@Entity('envio_notificacion')
export class EnvioNotificacion extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'plantilla_notificacion_id', type: 'int', nullable: true })
    plantillaNotificacionId: number;

    @ManyToOne(() => PlantillaNotificacion, { nullable: true })
    @JoinColumn({ name: 'plantilla_notificacion_id' })
    plantilla: PlantillaNotificacion;

    @Column({ type: 'varchar', length: 50, nullable: false })
    modelo: string; // 'factura'

    @Column({ name: 'modelo_id', type: 'int', nullable: true })
    modeloId: number | null; // ID de la entidad (null si el envío agrupa múltiples)

    @Column({
        type: 'enum',
        enum: ['email', 'whatsapp'],
        nullable: false,
    })
    canal: string;

    @Column({
        type: 'enum',
        enum: ['pendiente', 'enviado', 'error'],
        default: 'pendiente',
        nullable: false,
    })
    estado: string;

    @Column({ name: 'asunto_resuelto', type: 'varchar', length: 255, nullable: true })
    asuntoResuelto: string;

    @Column({ name: 'cuerpo_resuelto', type: 'text', nullable: false })
    cuerpoResuelto: string;

    @Column({ name: 'fecha_envio', type: 'varchar', length: 100, nullable: true })
    fechaEnvio: string;

    @Column({ name: 'email_destinatario', type: 'varchar', length: 100, nullable: true })
    emailDestinatario: string;

    @Column({ type: 'text', nullable: true })
    error: string; // Mensaje de error si el envío falló
}
