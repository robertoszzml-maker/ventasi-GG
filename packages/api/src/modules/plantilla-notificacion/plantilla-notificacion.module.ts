import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantillaNotificacionService } from './plantilla-notificacion.service';
import { PlantillaNotificacionController } from './plantilla-notificacion.controller';
import { PlantillaNotificacion } from './entities/plantilla-notificacion.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PlantillaNotificacion])],
    controllers: [PlantillaNotificacionController],
    providers: [PlantillaNotificacionService],
    exports: [PlantillaNotificacionService, TypeOrmModule],
})
export class PlantillaNotificacionModule {}
