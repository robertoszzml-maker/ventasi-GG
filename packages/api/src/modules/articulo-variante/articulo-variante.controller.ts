import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { IsOptional } from 'class-validator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { ArticuloVarianteService } from './articulo-variante.service';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUmbralVarianteDto } from './dto/update-umbrales-variante.dto';
import { BulkUmbralVarianteDto } from './dto/bulk-umbrales.dto';

class IngresoItemDto {
  @IsNumber()
  talleId: number;

  @IsNumber()
  colorId: number;

  @IsString()
  cantidad: string;
}

class RegistrarIngresoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngresoItemDto)
  items: IngresoItemDto[];
}

class AjustarCantidadDto {
  @IsString()
  cantidad: string;
}

@Controller('articulos')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ArticuloVarianteController {
  constructor(private readonly service: ArticuloVarianteService) {}

  @Get(':articuloId/grilla')
  @RequirePermissions(PERMISOS.ARTICULO_VER)
  getGrilla(@Param('articuloId', ParseIntPipe) articuloId: number) {
    return this.service.getGrilla(articuloId);
  }

  @Post(':articuloId/ingresos')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  registrarIngreso(
    @Param('articuloId', ParseIntPipe) articuloId: number,
    @Body() dto: RegistrarIngresoDto,
  ) {
    return this.service.registrarIngreso(articuloId, dto.items);
  }

  @Patch(':articuloId/variantes/:varianteId')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  ajustarCantidad(
    @Param('varianteId', ParseIntPipe) varianteId: number,
    @Body() dto: AjustarCantidadDto,
  ) {
    return this.service.ajustarCantidad(varianteId, dto.cantidad);
  }

  @Delete(':articuloId/variantes/:varianteId')
  @RequirePermissions(PERMISOS.ARTICULO_ELIMINAR)
  eliminarVariante(@Param('varianteId', ParseIntPipe) varianteId: number) {
    return this.service.eliminarVariante(varianteId);
  }

  @Patch(':articuloId/variantes/:varianteId/codigo-barras')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  actualizarCodigoBarras(
    @Param('varianteId', ParseIntPipe) varianteId: number,
    @Body() dto: { codigoBarras: string | null },
  ) {
    return this.service.actualizarCodigoBarras(varianteId, dto.codigoBarras);
  }

  @Patch(':articuloId/variantes/:varianteId/umbrales')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  actualizarUmbrales(
    @Param('varianteId', ParseIntPipe) varianteId: number,
    @Body() dto: UpdateUmbralVarianteDto,
  ) {
    return this.service.actualizarUmbrales(varianteId, dto);
  }

  @Post('variantes/bulk-umbrales')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  bulkUmbrales(@Body() dto: BulkUmbralVarianteDto) {
    return this.service.bulkUmbrales(dto.articuloId, dto);
  }

  @Post('variantes/:varianteId/copiar-umbrales')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  copiarUmbrales(@Param('varianteId', ParseIntPipe) varianteId: number) {
    return this.service.copiarUmbrales(varianteId);
  }
}
