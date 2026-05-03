import {
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity as TypeORMBaseEntity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Usuario } from '@/modules/auth/usuario/entities/usuario.entity';

export abstract class BaseEntity extends TypeORMBaseEntity {
    // @PrimaryGeneratedColumn()
    // id: number;

    @CreateDateColumn({ name: 'created_at', })
    createdAt?: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy?: number;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdByUser?: Usuario;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @Column({ name: 'updated_by', nullable: true })
    updatedBy?: number;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'updated_by' })
    updatedByUser?: Usuario;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy?: number;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'deleted_by' })
    deletedByUser?: Usuario;
}
