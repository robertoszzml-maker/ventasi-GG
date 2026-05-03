import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { ArticuloPrecioService } from './articulo-precio.service';
import { AplicarPorcentajeDto, UpdateArticuloPrecioDto, UpdatePrecioLoteDto } from './dto/create-articulo-precio.dto';

@Controller('articulo-precio')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ArticuloPrecioController {
  constructor(private readonly service: ArticuloPrecioService) {}

  @RequirePermissions(PERMISOS.LISTA_PRECIO_VER)
  @Get('por-lista/:listaPrecioId')
  findPorLista(@Param('listaPrecioId', ParseIntPipe) listaPrecioId: number) {
    return this.service.findPorLista(listaPrecioId);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_VER)
  @Get('por-articulo/:articuloId')
  findPorArticulo(@Param('articuloId', ParseIntPipe) articuloId: number) {
    return this.service.findPorArticulo(articuloId);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticuloPrecioDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_EDITAR)
  @Patch('lote/bulk')
  updateLote(@Body() dto: UpdatePrecioLoteDto) {
    return this.service.updateLote(dto);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_EDITAR)
  @Patch('aplicar-porcentaje/bulk')
  aplicarPorcentaje(@Body() dto: AplicarPorcentajeDto) {
    return this.service.aplicarPorcentaje(dto);
  }
}
