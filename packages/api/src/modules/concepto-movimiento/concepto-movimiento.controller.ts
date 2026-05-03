import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { ConceptoMovimientoService } from './concepto-movimiento.service';
import { CreateConceptoMovimientoDto } from './dto/create-concepto-movimiento.dto';
import { UpdateConceptoMovimientoDto } from './dto/update-concepto-movimiento.dto';

@Controller('conceptos-movimiento')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ConceptoMovimientoController {
  constructor(private readonly service: ConceptoMovimientoService) {}

  @Post()
  @RequirePermissions(PERMISOS.CONCEPTO_MOVIMIENTO_CREAR)
  create(@Body() dto: CreateConceptoMovimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.CONCEPTO_MOVIMIENTO_VER)
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

  @Get('activos')
  @RequirePermissions(PERMISOS.CONCEPTO_MOVIMIENTO_VER)
  findActivos() {
    return this.service.findActivos();
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.CONCEPTO_MOVIMIENTO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.CONCEPTO_MOVIMIENTO_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConceptoMovimientoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.CONCEPTO_MOVIMIENTO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
