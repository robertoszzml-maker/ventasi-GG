import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from '../role-permission/entities/role-permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) { }

  /**
   * Obtiene todos los roles padres de un rol dado (herencia jerárquica)
   */
  async getParentRoles(roleId: number): Promise<Role[]> {
    const parents: Role[] = [];
    let currentRole = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['parent'],
    });

    while (currentRole?.parent) {
      parents.push(currentRole.parent);
      currentRole = await this.roleRepository.findOne({
        where: { id: currentRole.parent.id },
        relations: ['parent'],
      });
    }

    return parents;
  }

  /**
   * Verifica si un rol tiene uno o más permisos requeridos (incluyendo herencia)
   * Los roles padres heredan los permisos de sus hijos
   */
  async roleHasPermissions(roleId: number, permissionCodes: string[]): Promise<boolean> {
    // Obtener todos los roles en la jerarquía (el rol actual + hijos)
    const roleIds = await this.getRoleWithChildren(roleId);
    // Buscar los permisos por código
    const permissions = await this.permissionRepository.find({
      where: { codigo: In(permissionCodes) },
    });

    if (permissions.length === 0) {
      return false;
    }

    const permissionIds = permissions.map(p => p.id);

    // Verificar si alguno de los roles en la jerarquía tiene alguno de los permisos
    const rolePermissions = await this.rolePermissionRepository.find({
      where: {
        roleId: In(roleIds),
        permissionId: In(permissionIds),
      },
    });

    return rolePermissions.length > 0;
  }

  /**
   * Obtiene el rol actual y todos sus roles hijos (descendientes)
   * Los padres heredan permisos de los hijos
   */
  async getRoleWithChildren(roleId: number): Promise<number[]> {
    const roleIds = [roleId];
    // TODO: DESCOMENTAR PARA HABILITAR HERENCIA JERARQUICA DE PERMISOS
    // const children = await this.getChildrenRoles(roleId);
    // roleIds.push(...children.map(r => r.id));
    return roleIds;
  }

  /**
   * Obtiene todos los roles hijos (descendientes) de un rol dado
   */
  async getChildrenRoles(roleId: number): Promise<Role[]> {
    const children: Role[] = [];
    const directChildren = await this.roleRepository.find({
      where: { parentId: roleId },
    });

    for (const child of directChildren) {
      children.push(child);
      const grandChildren = await this.getChildrenRoles(child.id);
      children.push(...grandChildren);
    }

    return children;
  }

  /**
   * Obtiene todos los permisos de un rol (incluyendo heredados)
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const roleIds = await this.getRoleWithChildren(roleId);

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: In(roleIds) },
      relations: ['permission'],
    });

    return rolePermissions.map(rp => rp.permission);
  }

  /**
   * Asigna un permiso a un rol
   */
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    // Verificar si ya existe
    const existing = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (existing) {
      return existing;
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId,
    });

    return this.rolePermissionRepository.save(rolePermission);
  }

  /**
   * Remueve un permiso de un rol
   */
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await this.rolePermissionRepository.delete({
      roleId,
      permissionId,
    });
  }

  /**
   * Asigna múltiples permisos a un rol (reemplaza los existentes)
   */
  async setRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    // Eliminar permisos existentes
    await this.rolePermissionRepository.delete({ roleId });

    // Crear nuevos permisos
    const rolePermissions = permissionIds.map(permissionId =>
      this.rolePermissionRepository.create({ roleId, permissionId })
    );

    await this.rolePermissionRepository.save(rolePermissions);
  }
}
