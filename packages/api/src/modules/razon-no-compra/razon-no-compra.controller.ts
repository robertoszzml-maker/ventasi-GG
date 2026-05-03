import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { RazonNoCompraService } from './razon-no-compra.service';
import { CreateRazonNoCompraDto, CreateSubRazonNoCompraDto } from './dto/create-razon-no-compra.dto';
import { UpdateRazonNoCompraDto, UpdateSubRazonNoCompraDto } from './dto/update-razon-no-compra.dto';

@Controller('razones-no-compra')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class RazonNoCompraController {
  constructor(private readonly service: RazonNoCompraService) {}

  @Get()
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_VER)
  findAll() {
    return this.service.findAll();
  }

  @Get('activas')
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_VER)
  findActivas() {
    return this.service.findActivas();
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_CREAR)
  create(@Body() dto: CreateRazonNoCompraDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRazonNoCompraDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/sub-razones')
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_CREAR)
  createSubRazon(@Param('id', ParseIntPipe) razonId: number, @Body() dto: CreateSubRazonNoCompraDto) {
    return this.service.createSubRazon(razonId, dto);
  }

  @Patch('sub-razones/:id')
  @RequirePermissions(PERMISOS.RAZON_NO_COMPRA_EDITAR)
  updateSubRazon(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubRazonNoCompraDto) {
    return this.service.updateSubRazon(id, dto);
  }
}
