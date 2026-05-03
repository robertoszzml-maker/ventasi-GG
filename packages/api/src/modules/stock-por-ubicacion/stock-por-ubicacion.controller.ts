import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { StockPorUbicacionService } from './stock-por-ubicacion.service';

@Controller('stock-por-ubicacion')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class StockPorUbicacionController {
  constructor(private readonly service: StockPorUbicacionService) {}

  @Get('articulo/:articuloId')
  @RequirePermissions(PERMISOS.STOCK_UBICACION_VER)
  findByArticulo(@Param('articuloId', ParseIntPipe) articuloId: number) {
    return this.service.findByArticulo(articuloId);
  }

  @Get('ubicacion/:ubicacionId')
  @RequirePermissions(PERMISOS.STOCK_UBICACION_VER)
  findByUbicacion(@Param('ubicacionId', ParseIntPipe) ubicacionId: number) {
    return this.service.findByUbicacion(ubicacionId);
  }
}
