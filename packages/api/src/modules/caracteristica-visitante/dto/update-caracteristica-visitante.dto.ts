import { PartialType } from '@nestjs/mapped-types';
import { CreateCaracteristicaVisitanteDto } from './create-caracteristica-visitante.dto';

export class UpdateCaracteristicaVisitanteDto extends PartialType(CreateCaracteristicaVisitanteDto) {}
