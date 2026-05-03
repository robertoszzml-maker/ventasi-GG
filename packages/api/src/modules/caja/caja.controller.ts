import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { CajaService } from './caja.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';

@Controller('cajas')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class CajaController {
  constructor(private readonly service: CajaService) {}

  @Post()
  @RequirePermissions(PERMISOS.CAJA_EDITAR)
  create(@Body() dto: CreateCajaDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.CAJA_VER)
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

  @Get(':id')
  @RequirePermissions(PERMISOS.CAJA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.CAJA_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCajaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.CAJA_EDITAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
