import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { PermissionsService } from '@/modules/auth/permissions/permissions.service';
import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';
import { ListaPrecioService } from './lista-precio.service';
import { CreateListaPrecioDto } from './dto/create-lista-precio.dto';
import { UpdateListaPrecioDto } from './dto/update-lista-precio.dto';

@Controller('lista-precio')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ListaPrecioController {
  constructor(
    private readonly service: ListaPrecioService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @RequirePermissions(PERMISOS.LISTA_PRECIO_VER)
  @Get()
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

  @RequirePermissions(PERMISOS.LISTA_PRECIO_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_CREAR)
  @Post()
  async create(@Body() dto: CreateListaPrecioDto, @Req() req: any) {
    const { role } = req.user as unknown as PayloadTokenWithRefreshToken;
    const tieneCosto = await this.permissionsService.roleHasPermissions(role, [PERMISOS.ARTICULO_VER_COSTO]);
    return this.service.create(dto, tieneCosto);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateListaPrecioDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions(PERMISOS.LISTA_PRECIO_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
