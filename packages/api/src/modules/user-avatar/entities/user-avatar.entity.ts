import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '@/modules/auth/usuario/entities/usuario.entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Entity('user_avatars')
export class UserAvatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'archivo_id', type: 'int' })
  archivoId: number;

  @ManyToOne(() => Archivo, { nullable: false })
  @JoinColumn({ name: 'archivo_id' })
  archivo: Archivo;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal: boolean;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
