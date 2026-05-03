import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req, ParseArrayPipe, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { PermissionsService } from '@/modules/auth/permissions/permissions.service';
import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';
import { ArticuloService } from './articulo.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { IsNumber, IsOptional } from 'class-validator';

class AgregarTalleDto {
  @IsNumber()
  talleId: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

class AgregarColorDto {
  @IsNumber()
  colorId: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

@Controller('articulos')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ArticuloController {
  constructor(
    private readonly service: ArticuloService,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async resolverPermisosCosto(req: any) {
    const { role } = req.user as unknown as PayloadTokenWithRefreshToken;
    const [verCosto, editarCosto] = await Promise.all([
      this.permissionsService.roleHasPermissions(role, [PERMISOS.ARTICULO_VER_COSTO]),
      this.permissionsService.roleHasPermissions(role, [PERMISOS.ARTICULO_EDITAR_COSTO]),
    ]);
    return { verCosto, editarCosto };
  }

  @Post()
  @RequirePermissions(PERMISOS.ARTICULO_CREAR)
  async create(@Body() dto: CreateArticuloDto, @Req() req: any) {
    const { verCosto, editarCosto } = await this.resolverPermisosCosto(req);
    return this.service.create(dto, verCosto, editarCosto);
  }

  @Get()
  @RequirePermissions(PERMISOS.ARTICULO_VER)
  async findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    const { verCosto } = await this.resolverPermisosCosto(req);
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.service.findAll({ where, order: orderBy, take, skip }, verCosto, search);
  }

  @Get('dashboard-anclas')
  @RequirePermissions(PERMISOS.DASHBOARD_ANCLAS_VER)
  getDashboardAnclas() {
    return this.service.getDashboardAnclas();
  }

  @Get('variantes-para-etiquetas')
  @RequirePermissions(PERMISOS.ETIQUETAS_IMPRIMIR)
  getVariantesParaEtiquetas(
    @Query('articuloIds', new ParseArrayPipe({ items: Number, separator: ',' })) articuloIds: number[],
  ) {
    return this.service.getVariantesParaEtiquetas(articuloIds);
  }

  @Get('variantes/buscar-barcode')
  @RequirePermissions(PERMISOS.ARTICULO_VER)
  async buscarPorBarcode(
    @Query('barcode') barcode: string,
    @Query('listaPrecioId') listaPrecioId?: string,
  ) {
    if (!barcode?.trim()) throw new BadRequestException('barcode requerido');
    const lista = listaPrecioId ? parseInt(listaPrecioId, 10) : undefined;
    const result = await this.service.buscarPorBarcode(barcode.trim(), lista && !isNaN(lista) ? lista : undefined);
    if (!result) throw new NotFoundException();
    return result;
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.ARTICULO_VER)
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { verCosto } = await this.resolverPermisosCosto(req);
    return this.service.findOne(id, verCosto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticuloDto, @Req() req: any) {
    const { verCosto, editarCosto } = await this.resolverPermisosCosto(req);
    return this.service.update(id, dto, verCosto, editarCosto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.ARTICULO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/talles')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  agregarTalle(@Param('id', ParseIntPipe) id: number, @Body() dto: AgregarTalleDto) {
    return this.service.agregarTalle(id, dto.talleId, dto.orden);
  }

  @Post(':id/colores')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  agregarColor(@Param('id', ParseIntPipe) id: number, @Body() dto: AgregarColorDto) {
    return this.service.agregarColor(id, dto.colorId, dto.orden);
  }
}
