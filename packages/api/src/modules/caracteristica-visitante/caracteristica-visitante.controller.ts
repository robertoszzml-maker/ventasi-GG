import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { CaracteristicaVisitanteService } from './caracteristica-visitante.service';
import { CreateCaracteristicaVisitanteDto } from './dto/create-caracteristica-visitante.dto';
import { UpdateCaracteristicaVisitanteDto } from './dto/update-caracteristica-visitante.dto';

@Controller('caracteristicas-visitante')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class CaracteristicaVisitanteController {
  constructor(private readonly service: CaracteristicaVisitanteService) {}

  @Post()
  @RequirePermissions(PERMISOS.CARACTERISTICA_VISITANTE_CREAR)
  create(@Body() dto: CreateCaracteristicaVisitanteDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.CARACTERISTICA_VISITANTE_VER)
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

  @Get('activas')
  @RequirePermissions(PERMISOS.CARACTERISTICA_VISITANTE_VER)
  findActivas() {
    return this.service.findActivas();
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.CARACTERISTICA_VISITANTE_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.CARACTERISTICA_VISITANTE_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCaracteristicaVisitanteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.CARACTERISTICA_VISITANTE_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
