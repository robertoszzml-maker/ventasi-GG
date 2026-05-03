import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ClienteController {
  constructor(
    private readonly service: ClienteService,
    @Inject('AFIP_SERVICE') private readonly afipClient: ClientProxy,
  ) {}

  @Post()
  @RequirePermissions(PERMISOS.CLIENTE_CREAR)
  create(@Body() dto: CreateClienteDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.CLIENTE_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
    @Query('search') search: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.service.findAll({ where, order: orderBy, take, skip }, search);
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.CLIENTE_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.CLIENTE_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.CLIENTE_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('padron/:cuit')
  @RequirePermissions(PERMISOS.CLIENTE_VER)
  async getPadron(@Param('cuit') cuit: string) {
    return firstValueFrom(this.afipClient.send('get-padron', { cuit }));
  }
}
