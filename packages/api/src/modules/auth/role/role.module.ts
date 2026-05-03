import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionsModule } from '../permissions/permissions.module';


@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule { }
