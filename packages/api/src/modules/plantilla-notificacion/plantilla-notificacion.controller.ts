import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { PlantillaNotificacionService } from './plantilla-notificacion.service';
import { CreatePlantillaNotificacionDto } from './dto/create-plantilla-notificacion.dto';
import { UpdatePlantillaNotificacionDto } from './dto/update-plantilla-notificacion.dto';

@Controller('plantilla-notificacion')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class PlantillaNotificacionController {
    constructor(private readonly service: PlantillaNotificacionService) {}

    @RequirePermissions(PERMISOS.PLANTILLA_NOTIFICACION_VER)
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

    @RequirePermissions(PERMISOS.PLANTILLA_NOTIFICACION_VER)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @RequirePermissions(PERMISOS.PLANTILLA_NOTIFICACION_CREAR)
    @Post()
    create(@Body() dto: CreatePlantillaNotificacionDto) {
        return this.service.create(dto);
    }

    @RequirePermissions(PERMISOS.PLANTILLA_NOTIFICACION_EDITAR)
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePlantillaNotificacionDto,
    ) {
        return this.service.update(id, dto);
    }

    @RequirePermissions(PERMISOS.PLANTILLA_NOTIFICACION_ELIMINAR)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
