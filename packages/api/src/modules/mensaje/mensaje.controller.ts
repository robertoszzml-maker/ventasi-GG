import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { MensajeService } from './mensaje.service';
import { PERMISOS } from '@/constants/permisos';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions/require-permissions.decorator';



@Controller('mensaje')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) { }

  @RequirePermissions(PERMISOS.MENSAJES_CREAR)
  @Post()
  create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.mensajeService.create(createMensajeDto);
  }

  @RequirePermissions(PERMISOS.MENSAJES_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('search') filter: string,
    @Query('order') order: string,
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
    return this.mensajeService.findAll(options);
  }

  @RequirePermissions(PERMISOS.MENSAJES_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.findOne(+id);
  }

  @RequirePermissions(PERMISOS.MENSAJES_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMensajeDto: UpdateMensajeDto) {
    return this.mensajeService.update(+id, updateMensajeDto);
  }

  @RequirePermissions(PERMISOS.MENSAJES_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.remove(+id);
  }
}
