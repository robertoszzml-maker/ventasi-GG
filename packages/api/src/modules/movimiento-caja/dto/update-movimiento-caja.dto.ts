import { PartialType } from '@nestjs/swagger';
import { CreateMovimientoCajaDto } from './create-movimiento-caja.dto';

export class UpdateMovimientoCajaDto extends PartialType(CreateMovimientoCajaDto) {}
