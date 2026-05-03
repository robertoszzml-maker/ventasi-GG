import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EjemploCategoriaService } from './ejemplo-categoria.service';
import { CreateEjemploCategoriaDto } from './dto/create-ejemplo-categoria.dto';
import { UpdateEjemploCategoriaDto } from './dto/update-ejemplo-categoria.dto';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';

@Controller('ejemplo-categorias')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EjemploCategoriaController {
  constructor(private readonly service: EjemploCategoriaService) {}

  @Post()
  @RequirePermissions(PERMISOS.EJEMPLO_CATEGORIA_CREAR)
  create(@Body() dto: CreateEjemploCategoriaDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.EJEMPLO_CATEGORIA_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.service.findAll({ where, order: orderBy, take, skip });
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.EJEMPLO_CATEGORIA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.EJEMPLO_CATEGORIA_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEjemploCategoriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.EJEMPLO_CATEGORIA_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
