import { Module } from '@nestjs/common';
import { MensajeController } from './mensaje.controller';
import { MensajeService } from './mensaje.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { ArchivoModule } from '../archivo/archivo.module';
import { NotificacionModule } from '../notificacion/notificacion.module';


@Module({
  imports: [TypeOrmModule.forFeature([Mensaje]), ArchivoModule, NotificacionModule],
  controllers: [MensajeController],
  providers: [MensajeService],
  exports: [TypeOrmModule, MensajeService]
})
export class MensajeModule { }
