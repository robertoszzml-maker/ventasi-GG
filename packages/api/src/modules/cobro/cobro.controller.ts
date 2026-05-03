import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { CobroService } from './cobro.service';
import { CreateCobroDto } from './dto/create-cobro.dto';

@Controller('cobros')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class CobroController {
  constructor(private readonly service: CobroService) {}

  @Post()
  @RequirePermissions(PERMISOS.COBRO_CREAR)
  crear(@Body() dto: CreateCobroDto) {
    return this.service.crear(dto);
  }

  @Get('venta/:ventaId')
  @RequirePermissions(PERMISOS.COBRO_VER)
  listarPorVenta(@Param('ventaId', ParseIntPipe) ventaId: number) {
    return this.service.listarPorVenta(ventaId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.COBRO_CREAR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
