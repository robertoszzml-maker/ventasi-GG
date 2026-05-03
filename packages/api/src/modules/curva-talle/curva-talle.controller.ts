import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { CurvaTalleService } from './curva-talle.service';
import { CreateCurvaTalleDto } from './dto/create-curva-talle.dto';
import { UpdateCurvaTalleDto } from './dto/update-curva-talle.dto';
import { IsArray, IsNumber } from 'class-validator';

class UpdateTallesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  talleIds: number[];
}

@Controller('curvas-talle')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class CurvaTalleController {
  constructor(private readonly service: CurvaTalleService) {}

  @Post()
  @RequirePermissions(PERMISOS.CURVA_TALLE_CREAR)
  create(@Body() dto: CreateCurvaTalleDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.CURVA_TALLE_VER)
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
  @RequirePermissions(PERMISOS.CURVA_TALLE_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.CURVA_TALLE_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCurvaTalleDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/talles')
  @RequirePermissions(PERMISOS.CURVA_TALLE_EDITAR)
  actualizarTalles(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTallesDto) {
    return this.service.actualizarTalles(id, dto.talleIds);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.CURVA_TALLE_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
