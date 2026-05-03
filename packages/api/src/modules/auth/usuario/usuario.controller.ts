import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key/api-key.guard';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioService } from './usuario.service';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';
import { PERMISOS } from '@/constants/permisos';
import { RequirePermissions } from '../decorators/require-permissions/require-permissions.decorator';

@Controller('usuario')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @RequirePermissions(PERMISOS.USUARIOS_CREAR)
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @RequirePermissions(PERMISOS.USUARIOS_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order
      ? JSON.parse(order)
      : {};
    const options = {
      where,
      order: orderBy,
      take,
      skip,
    };
    return this.usuarioService.findAll(options);
  }

  @RequirePermissions(PERMISOS.USUARIOS_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @RequirePermissions(PERMISOS.USUARIOS_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @RequirePermissions(PERMISOS.USUARIOS_EDITAR)
  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleId', ParseIntPipe) roleId: number
  ) {
    return this.usuarioService.updateRole(id, roleId);
  }

  @RequirePermissions(PERMISOS.USUARIOS_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }
}
