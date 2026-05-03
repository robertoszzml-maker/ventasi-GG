import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { MedioPagoService } from './medio-pago.service';
import { CreateMedioPagoDto } from './dto/create-medio-pago.dto';
import { UpdateMedioPagoDto } from './dto/update-medio-pago.dto';

@Controller('medios-pago')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MedioPagoController {
  constructor(private readonly service: MedioPagoService) {}

  @Get()
  @RequirePermissions(PERMISOS.MEDIO_PAGO_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.service.findAll({ where, order: orderBy, take, skip });
  }

  @Get('activos')
  @RequirePermissions(PERMISOS.MEDIO_PAGO_VER)
  findActivos() {
    return this.service.findActivos();
  }

  @Get('codigo/:codigo')
  @RequirePermissions(PERMISOS.MEDIO_PAGO_VER)
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.service.buscarPorCodigo(codigo);
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.MEDIO_PAGO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISOS.MEDIO_PAGO_CREAR)
  create(@Body() dto: CreateMedioPagoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.MEDIO_PAGO_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedioPagoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.MEDIO_PAGO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
