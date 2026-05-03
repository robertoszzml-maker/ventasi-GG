import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Controller('ventas')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class VentaController {
  constructor(private readonly service: VentaService) {}

  @Post()
  @RequirePermissions(PERMISOS.VENTA_CREAR)
  crear(@Body() dto: CreateVentaDto) {
    return this.service.crear(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.VENTA_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    return this.service.findAll(take, skip, filter, order);
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.VENTA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.VENTA_EDITAR)
  guardar(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateVentaDto) {
    return this.service.guardar(id, dto);
  }

  @Post(':id/confirmar')
  @RequirePermissions(PERMISOS.VENTA_CONFIRMAR)
  confirmar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.confirmar(id, req.user?.id);
  }

  @Post(':id/emitir-manual')
  @RequirePermissions(PERMISOS.COMPROBANTE_EMITIR_MANUAL)
  emitirManual(
    @Param('id', ParseIntPipe) id: number,
    @Query('formato') formato: string,
  ) {
    return this.service.emitirManual(id, formato);
  }

  @Post(':id/emitir-fiscal')
  @RequirePermissions(PERMISOS.COMPROBANTE_EMITIR_FISCAL)
  emitirFiscal(
    @Param('id', ParseIntPipe) id: number,
    @Query('formato') formato: string,
  ) {
    return this.service.emitirFiscal(id, formato);
  }

  @Post(':id/reintentar')
  @RequirePermissions(PERMISOS.COMPROBANTE_EMITIR_FISCAL)
  reintentar(@Param('id', ParseIntPipe) id: number) {
    return this.service.reintentar(id);
  }

  @Delete(':id/anular')
  @RequirePermissions(PERMISOS.VENTA_ANULAR)
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.service.anular(id);
  }
}
