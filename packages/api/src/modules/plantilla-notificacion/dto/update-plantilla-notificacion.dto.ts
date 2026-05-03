import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantillaNotificacionDto } from './create-plantilla-notificacion.dto';

export class UpdatePlantillaNotificacionDto extends PartialType(CreatePlantillaNotificacionDto) {}
