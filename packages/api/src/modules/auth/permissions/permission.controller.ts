import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../guards/api-key/api-key.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';
import { RequirePermissions } from '../decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';

@Controller('permission')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.PERMISOS_GESTIONAR)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
