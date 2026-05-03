import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RolePermission } from '../../role-permission/entities/role-permission.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'parent_id',
    type: 'int',
    nullable: true,
  })
  parentId: number;

  @Column({
    name: 'nivel',
    type: 'int',
    nullable: true,
  })
  nivel: number;

  @Column({
    name: 'color',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  color: string;

  @Column({
    name: 'icono',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  icono: string;

  @ManyToOne(() => Role, role => role.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Role;

  @OneToMany(() => Role, role => role.parent)
  children: Role[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  // @CreateDateColumn({
  //   name: 'created_at',
  //   type: 'timestamp',
  // })
  // createdAt: Date;

  // @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  // updateAt?: Date;

  // @Column({ name: 'deleted_at', nullable: true, default: null })
  // deletedAt?: Date;
}


// import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinColumn } from 'typeorm';
// import { Usuario } from '../../usuario/entities/usuario.entity';
// import { RoleUser } from '../../role-user/entities/role-user.entity';

// @Entity({ name: 'permiso' })
// export class Role {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({
//     name: 'nombre',
//     type: 'varchar',
//     length: 30,
//     nullable: false,
//   })
//   nombre: string;

//   @OneToMany(() => RoleUser, roleUsuario => roleUsuario.role)
//   roles: RoleUser[];

// }
