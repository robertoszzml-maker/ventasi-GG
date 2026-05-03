import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { CurvaColorService } from './curva-color.service';
import { CreateCurvaColorDto } from './dto/create-curva-color.dto';
import { UpdateCurvaColorDto } from './dto/update-curva-color.dto';
import { IsArray, IsNumber } from 'class-validator';

class UpdateColoresDto {
  @IsArray()
  @IsNumber({}, { each: true })
  colorIds: number[];
}

@Controller('curvas-color')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class CurvaColorController {
  constructor(private readonly service: CurvaColorService) {}

  @Post()
  @RequirePermissions(PERMISOS.CURVA_COLOR_CREAR)
  create(@Body() dto: CreateCurvaColorDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.CURVA_COLOR_VER)
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
  @RequirePermissions(PERMISOS.CURVA_COLOR_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.CURVA_COLOR_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCurvaColorDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/colores')
  @RequirePermissions(PERMISOS.CURVA_COLOR_EDITAR)
  actualizarColores(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateColoresDto) {
    return this.service.actualizarColores(id, dto.colorIds);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.CURVA_COLOR_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
