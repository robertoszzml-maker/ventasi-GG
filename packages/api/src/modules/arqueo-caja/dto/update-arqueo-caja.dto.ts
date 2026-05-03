import { PartialType } from '@nestjs/swagger';
import { CreateArqueoCajaDto } from './create-arqueo-caja.dto';

export class UpdateArqueoCajaDto extends PartialType(CreateArqueoCajaDto) {}
