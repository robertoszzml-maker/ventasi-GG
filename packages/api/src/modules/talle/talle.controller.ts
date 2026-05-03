import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { TalleService } from './talle.service';
import { CreateTalleDto } from './dto/create-talle.dto';
import { UpdateTalleDto } from './dto/update-talle.dto';

@Controller('talles')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class TalleController {
  constructor(private readonly service: TalleService) {}

  @Post()
  @RequirePermissions(PERMISOS.TALLE_CREAR)
  create(@Body() dto: CreateTalleDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.TALLE_VER)
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
  @RequirePermissions(PERMISOS.TALLE_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.TALLE_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTalleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.TALLE_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
