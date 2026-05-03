import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { VisitaService } from './visita.service';
import { CreateVisitaDto, ResolverCompraDto, ResolverNoCompraDto } from './dto/create-visita.dto';
import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';

@Controller('visitas')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class VisitaController {
  constructor(private readonly service: VisitaService) {}

  @Post()
  @RequirePermissions(PERMISOS.VISITA_CREAR)
  crear(@Body() dto: CreateVisitaDto, @Req() req: any) {
    const { uid } = req.user as unknown as PayloadTokenWithRefreshToken;
    return this.service.crear(dto, uid);
  }

  @Patch(':id/compra')
  @RequirePermissions(PERMISOS.VISITA_EDITAR)
  resolverCompra(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverCompraDto) {
    return this.service.resolverCompra(id, dto);
  }

  @Patch(':id/no-compra')
  @RequirePermissions(PERMISOS.VISITA_EDITAR)
  resolverNoCompra(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverNoCompraDto) {
    return this.service.resolverNoCompra(id, dto);
  }

  @Get('pendientes')
  @RequirePermissions(PERMISOS.VISITA_VER)
  findPendientes() {
    return this.service.findPendientesDelDia();
  }

  @Get('metricas-dia')
  @RequirePermissions(PERMISOS.VISITA_VER)
  metricasDia() {
    return this.service.metricasDelDia();
  }

  @Get('dashboard')
  @RequirePermissions(PERMISOS.DASHBOARD_CONVERSION_VER)
  dashboard(@Query('periodo') periodo: 'hoy' | 'semana' | 'mes' = 'hoy') {
    return this.service.dashboard(periodo);
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.VISITA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
