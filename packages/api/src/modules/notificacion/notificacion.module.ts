import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { ArchivoModule } from '../archivo/archivo.module';
import { Usuario } from '../auth/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, Usuario]), ArchivoModule],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [TypeOrmModule, NotificacionService]
})
export class NotificacionModule { }
