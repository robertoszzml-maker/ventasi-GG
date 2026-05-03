import { Usuario } from '@/modules/auth/usuario/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('auditoria')
export class Auditoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    tabla: string;

    @Column({ type: 'varchar', length: 255 })
    columna: string;

    @Column({ type: 'text', name: 'valor_anterior', nullable: true })
    valorAnterior?: string;

    @Column({ type: 'text', name: 'valor_nuevo', nullable: true })
    valorNuevo?: string;

    @Column({ type: 'int', name: 'registro_id' })
    registroId: number;

    @Column({ type: 'int', name: 'usuario_id' })
    usuarioId: number;

    @ManyToOne(() => Usuario, usuario => usuario.id)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;


    @Column({ type: 'timestamp' })
    fecha: string;
}
