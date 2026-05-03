import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvioNotificacionService } from './envio-notificacion.service';
import { EnvioNotificacionController } from './envio-notificacion.controller';
import { EnvioNotificacion } from './entities/envio-notificacion.entity';
import { PlantillaNotificacion } from '@/modules/plantilla-notificacion/entities/plantilla-notificacion.entity';
import { EmailService } from '@/services/email/email.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnvioNotificacion,
            PlantillaNotificacion,
        ]),
    ],
    controllers: [EnvioNotificacionController],
    providers: [EnvioNotificacionService, EmailService],
    exports: [EnvioNotificacionService, TypeOrmModule],
})
export class EnvioNotificacionModule {}
