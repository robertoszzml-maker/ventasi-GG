import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { ArqueoCajaService } from './arqueo-caja.service';
import { CreateArqueoCajaDto } from './dto/create-arqueo-caja.dto';

@Controller('arqueos-caja')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ArqueoCajaController {
  constructor(private readonly service: ArqueoCajaService) {}

  @Post()
  @RequirePermissions(PERMISOS.ARQUEO_CAJA_CREAR)
  create(@Body() dto: CreateArqueoCajaDto, @Request() req: any) {
    return this.service.create(dto, req.user?.uid);
  }

  @Get()
  @RequirePermissions(PERMISOS.ARQUEO_CAJA_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : { id: 'DESC' };
    return this.service.findAll({ where, order: orderBy, take, skip });
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.ARQUEO_CAJA_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
