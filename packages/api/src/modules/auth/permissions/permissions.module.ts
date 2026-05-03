import { Global, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Role } from '../role/entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from '../role-permission/entities/role-permission.entity';
import { PermissionsHelper } from '@/helpers/has-permissions.helper';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [PermissionController],
  providers: [PermissionsService, PermissionService],
  exports: [PermissionsService, PermissionService, TypeOrmModule],
})
export class PermissionsModule implements OnModuleInit {
  constructor(private readonly permissionsService: PermissionsService) { }

  onModuleInit() {
    // Inicializar el helper con la instancia del servicio
    PermissionsHelper.setService(this.permissionsService);
  }
}
