import {
  Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Query
} from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ArchivoService } from './archivo.service';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { UpdateArchivoDto } from './dto/update-archivo.dto';
import { File } from '@nest-lab/fastify-multer';
import { fileStorageInterceptor } from './file-storage-interceptor';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';
import { PERMISOS } from '@/constants/permisos';
import { RequirePermissions } from '../auth/decorators/require-permissions/require-permissions.decorator';

@Controller('archivo')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) { }

  @Post()
  @RequirePermissions(PERMISOS.ARCHIVOS_CREAR)
  @UseInterceptors(fileStorageInterceptor()) // Usamos el interceptor reutilizable
  create(
    @Body() createArchivoDto: CreateArchivoDto,
    @UploadedFile() file: File) {
    return this.archivoService.create(createArchivoDto, file);
  }

  @RequirePermissions(PERMISOS.ARCHIVOS_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
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
    return this.archivoService.findAll(options);
  }


  @RequirePermissions(PERMISOS.ARCHIVOS_VER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.archivoService.findOne(+id);
  }

  @RequirePermissions(PERMISOS.ARCHIVOS_VER)
  @Get('file/:id')
  getFile(@Param('id') id: string) {
    return this.archivoService.getFile(+id);

  }
  @RequirePermissions(PERMISOS.ARCHIVOS_VER)
  @Get('file')
  getFiles(@Query('id') ids: string[]) {
    // Convertir los IDs de string a número (si es necesario)
    const numericIds = ids.map((id) => +id);
    return this.archivoService.getFiles(numericIds);
  }


  @Patch(':id')
  @RequirePermissions(PERMISOS.ARCHIVOS_EDITAR)
  @UseInterceptors(fileStorageInterceptor()) // Usamos el interceptor reutilizable
  update(
    @Param('id') id: string,
    @Body() updateArchivoDto: UpdateArchivoDto,
    @UploadedFile() file: File
  ) {
    // Se pasa el archivo nuevo y los datos de la actualización al servicio
    return this.archivoService.update(+id, updateArchivoDto, file);
  }

  @RequirePermissions(PERMISOS.ARCHIVOS_ELIMINAR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.archivoService.remove(+id);
  }
}
