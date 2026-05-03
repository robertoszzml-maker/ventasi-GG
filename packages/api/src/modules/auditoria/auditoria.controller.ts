import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';


@Controller('auditoria')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) { }

  @Post()
  @RequirePermissions(PERMISOS.AUDITORIA_CREAR)
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Get()
  @RequirePermissions(PERMISOS.AUDITORIA_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string, // Recibe el filtro como string
    @Query('order') order: string,  // Recibe el orden como string

  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order
      ? JSON.parse(order)
      : {};

    const options = {
      where,
      order: orderBy,
      take,
      skip,
    };

    return this.auditoriaService.findAll(options);
  }

  @Get('presupuesto/:registroId/historial')
  @RequirePermissions(PERMISOS.AUDITORIA_PRESUPUESTO_HISTORIAL)
  findPresupuestoHistorial(@Param('registroId') registroId: string) {
    return this.auditoriaService.findPresupuestoHistorial(+registroId);
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.AUDITORIA_VER)
  findOne(@Param('id') id: string) {
    return this.auditoriaService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.AUDITORIA_EDITAR)
  update(@Param('id') id: string, @Body() updateAuditoriaDto: UpdateAuditoriaDto) {
    return this.auditoriaService.update(+id, updateAuditoriaDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.AUDITORIA_ELIMINAR)
  remove(@Param('id') id: string) {
    return this.auditoriaService.remove(+id);
  }
}
