import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Role } from '@/modules/auth/role/entities/role.entity';
import { UserAvatar } from '@/modules/user-avatar/entities/user-avatar.entity';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 70,
    nullable: false,
    unique: true,
  })
  email: string;

  @Exclude()
  @Column({
    name: 'pwd',
    type: 'varchar',
    length: 80,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombre?: string;

  @Column({
    name: 'activo',
    type: 'int',
    nullable: false,
    default: 1,
  })
  active?: number;

  @Column({
    name: 'tel1',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono?: string;

  @Column({
    name: 'tel2',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefonoOtro?: string;

  @Column({
    name: 'refresh_token',
    type: 'longtext',
    unique: true,
    nullable: true,
  })
  refreshToken?: string;

  @Column({ type: 'integer', default: 0 })
  attemps?: number;

  // Nuevo campo: cada usuario tiene UN SOLO rol
  @Column({
    name: 'permisoId',
    type: 'int',
    nullable: true,
  })
  roleId?: number;

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({
    name: 'permisoId'
  })
  role: Role;

  // Campo para el avatar principal del usuario
  @Column({
    name: 'avatar_id',
    type: 'int',
    nullable: true,
  })
  avatarId?: number;

  @OneToOne(() => UserAvatar)
  @JoinColumn({
    name: 'avatar_id'
  })
  avatar?: UserAvatar;
}
