import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Role } from '@/modules/auth/role/entities/role.entity';
import { Permission } from '@/modules/auth/permissions/entities/permission.entity';

@Entity({ name: 'permiso_permission' })
export class PermisoPermission {
  @PrimaryColumn({ name: 'permiso_id' })
  permisoId: number;

  @PrimaryColumn({ name: 'permission_id' })
  permissionId: number;

  @Column({ name: 'allow', type: 'tinyint', width: 1, default: 1 })
  allow: number;

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({ name: 'permiso_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

}
