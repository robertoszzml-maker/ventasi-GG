import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';
import { QueryMovimientoInventarioDto } from './dto/query-movimiento-inventario.dto';

@Controller('movimientos-inventario')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MovimientoInventarioController {
  constructor(private readonly service: MovimientoInventarioService) {}

  @Post()
  @RequirePermissions(PERMISOS.MOVIMIENTO_INVENTARIO_CREAR)
  create(@Body() dto: CreateMovimientoInventarioDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.MOVIMIENTO_INVENTARIO_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('tipo') tipo: string,
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
    @Query('ubicacionId') ubicacionId: string,
  ) {
    const query: QueryMovimientoInventarioDto = {};
    if (tipo) query.tipo = tipo as any;
    if (fechaDesde) query.fechaDesde = fechaDesde;
    if (fechaHasta) query.fechaHasta = fechaHasta;
    if (ubicacionId) query.ubicacionId = ubicacionId;
    return this.service.findAll(query, take, skip);
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.MOVIMIENTO_INVENTARIO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
