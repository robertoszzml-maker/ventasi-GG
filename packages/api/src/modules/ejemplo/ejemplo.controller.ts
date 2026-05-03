import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EjemploService } from './ejemplo.service';
import { CreateEjemploDto } from './dto/create-ejemplo.dto';
import { UpdateEjemploDto } from './dto/update-ejemplo.dto';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';

@Controller('ejemplos')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EjemploController {
  constructor(private readonly service: EjemploService) {}

  @Post()
  @RequirePermissions(PERMISOS.EJEMPLO_CREAR)
  create(@Body() dto: CreateEjemploDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.EJEMPLO_VER)
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
  @RequirePermissions(PERMISOS.EJEMPLO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.EJEMPLO_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEjemploDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.EJEMPLO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
