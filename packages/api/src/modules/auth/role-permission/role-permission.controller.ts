import { Controller, Get, Post, Body, Delete, Param, UseGuards, Put } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto, SetRolePermissionsDto } from './dto/create-role-permission.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../guards/api-key/api-key.guard';
import { RequirePermissions } from '../decorators/require-permissions/require-permissions.decorator';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';
import { PERMISOS } from '@/constants/permisos';

@Controller('role-permission')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)

export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) { }

  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  @Post()
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  @Get()
  findAll() {
    return this.rolePermissionService.findAll();
  }

  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  @Get('role/:roleId')
  findByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionService.findByRole(+roleId);
  }

  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  @Put('role/:roleId')
  setRolePermissions(@Param('roleId') roleId: string, @Body() dto: SetRolePermissionsDto) {
    return this.rolePermissionService.setRolePermissions(+roleId, dto.permissionIds);
  }

  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  @Delete(':roleId/:permissionId')
  remove(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolePermissionService.remove(+roleId, +permissionId);
  }
}
