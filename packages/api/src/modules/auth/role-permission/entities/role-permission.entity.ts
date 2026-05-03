import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity({ name: 'role_permissions' })
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_id',
    type: 'int',
    nullable: false,
  })
  roleId: number;

  @Column({
    name: 'permission_id',
    type: 'int',
    nullable: false,
  })
  permissionId: number;

  @ManyToOne(() => Role, role => role.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
