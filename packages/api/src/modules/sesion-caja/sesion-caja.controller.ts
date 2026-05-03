import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { SesionCajaService } from './sesion-caja.service';
import { AbrirCajaDto, CerrarCajaDto } from './dto/create-sesion-caja.dto';

@Controller('sesiones-caja')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class SesionCajaController {
  constructor(private readonly service: SesionCajaService) {}

  @Get('activa')
  @RequirePermissions(PERMISOS.SESION_CAJA_VER)
  getActiva() {
    return this.service.getActiva();
  }

  @Post('abrir')
  @RequirePermissions(PERMISOS.SESION_CAJA_ABRIR)
  abrir(@Body() dto: AbrirCajaDto, @Request() req: any) {
    return this.service.abrir(dto, req.user?.uid);
  }

  @Post(':id/cerrar')
  @RequirePermissions(PERMISOS.SESION_CAJA_CERRAR)
  cerrar(@Param('id', ParseIntPipe) id: number, @Body() dto: CerrarCajaDto) {
    return this.service.cerrar(id, dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.SESION_CAJA_VER)
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
  @RequirePermissions(PERMISOS.SESION_CAJA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneConDetalle(id);
  }
}
