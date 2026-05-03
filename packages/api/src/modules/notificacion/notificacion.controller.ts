import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { NotificacionService } from './notificacion.service';
import { In } from 'typeorm';
import { PERMISOS } from '@/constants/permisos';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions/require-permissions.decorator';


@Controller('notificacion')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) { }

  @RequirePermissions(PERMISOS.NOTIFICACIONES_CREAR)
  @Post()
  create(@Body() createNotificacionDto: CreateNotificacionDto) {
    return this.notificacionService.create(createNotificacionDto);
  }
  @RequirePermissions(PERMISOS.NOTIFICACIONES_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('search') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    if (!where.crud) {
      delete where.crud;
      where.usuarioDestinoId = In([0, where.usuarioDestinoId]);
    }
    const orderBy = order
      ? JSON.parse(order)
      : {
        fecha: 'desc'
      };
    const options = {
      where,
      order: orderBy,
      take,
      skip,
    };
    return this.notificacionService.findAll(options);
  }

  @RequirePermissions(PERMISOS.NOTIFICACIONES_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionService.findOne(+id);
  }

  @RequirePermissions(PERMISOS.NOTIFICACIONES_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNotificacionDto: UpdateNotificacionDto) {
    return this.notificacionService.update(+id, updateNotificacionDto);
  }

  @RequirePermissions(PERMISOS.NOTIFICACIONES_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionService.remove(+id);
  }
}
