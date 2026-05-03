import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { SubgrupoService } from './subgrupo.service';
import { CreateSubgrupoDto } from './dto/create-subgrupo.dto';
import { UpdateSubgrupoDto } from './dto/update-subgrupo.dto';

@Controller('subgrupos')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class SubgrupoController {
  constructor(private readonly service: SubgrupoService) {}

  @Post()
  @RequirePermissions(PERMISOS.SUBGRUPO_CREAR)
  create(@Body() dto: CreateSubgrupoDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.SUBGRUPO_VER)
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
  @RequirePermissions(PERMISOS.SUBGRUPO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.SUBGRUPO_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubgrupoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.SUBGRUPO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
