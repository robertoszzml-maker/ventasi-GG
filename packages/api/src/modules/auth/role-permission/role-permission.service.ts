import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(createRolePermissionDto: CreateRolePermissionDto): Promise<RolePermission> {
    const rolePermission = this.rolePermissionRepository.create(createRolePermissionDto);
    return this.rolePermissionRepository.save(rolePermission);
  }

  async findAll(): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      relations: ['role', 'permission'],
    });
  }

  async findByRole(roleId: number): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
  }

  async remove(roleId: number, permissionId: number): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }

  async setRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    // Eliminar permisos existentes
    await this.rolePermissionRepository.delete({ roleId });

    // Crear nuevos permisos
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId =>
        this.rolePermissionRepository.create({ roleId, permissionId })
      );
      await this.rolePermissionRepository.save(rolePermissions);
    }
  }
}
