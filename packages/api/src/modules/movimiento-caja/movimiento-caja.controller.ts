import { Controller, Get, Post, Body, Query, ParseIntPipe, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { MovimientoCajaService } from './movimiento-caja.service';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';

@Controller('movimientos-caja')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MovimientoCajaController {
  constructor(private readonly service: MovimientoCajaService) {}

  @Post()
  @RequirePermissions(PERMISOS.MOVIMIENTO_CAJA_CREAR)
  create(@Body() dto: CreateMovimientoCajaDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.MOVIMIENTO_CAJA_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : { id: 'DESC' };
    return this.service.findAll({ where, order: orderBy, take, skip });
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.MOVIMIENTO_CAJA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
