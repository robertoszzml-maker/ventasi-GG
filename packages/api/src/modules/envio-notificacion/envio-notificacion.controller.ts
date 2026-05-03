import {
    Controller, Get, Post, Body, Param, Delete,
    Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { EnvioNotificacionService } from './envio-notificacion.service';
import { EnviarDto } from './dto/enviar.dto';
import { PreviewNotificacionDto } from './dto/preview-notificacion.dto';

@Controller('envio-notificacion')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class EnvioNotificacionController {
    constructor(private readonly service: EnvioNotificacionService) { }

    @RequirePermissions(PERMISOS.ENVIO_NOTIFICACION_VER)
    @Get()
    findAll(
        @Query('limit') take: number,
        @Query('skip') skip: number,
        @Query('filter') filter: string,
        @Query('order') order: string,
    ) {
        const where = filter ? JSON.parse(filter) : [];
        const orderBy = order ? JSON.parse(order) : { createdAt: 'DESC' };
        return this.service.findAll({ where, order: orderBy, take, skip });
    }

    @RequirePermissions(PERMISOS.ENVIO_NOTIFICACION_VER)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @RequirePermissions(PERMISOS.ENVIO_NOTIFICACION_CREAR)
    @Post('preview')
    preview(@Body() dto: PreviewNotificacionDto) {
        return this.service.preview(dto);
    }

    @RequirePermissions(PERMISOS.ENVIO_NOTIFICACION_CREAR)
    @Post('enviar')
    enviar(@Body() dto: EnviarDto) {
        return this.service.enviar(dto);
    }

    @RequirePermissions(PERMISOS.ENVIO_NOTIFICACION_ELIMINAR)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
