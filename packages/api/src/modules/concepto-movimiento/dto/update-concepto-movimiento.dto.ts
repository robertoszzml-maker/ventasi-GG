import { PartialType } from '@nestjs/swagger';
import { CreateConceptoMovimientoDto } from './create-concepto-movimiento.dto';

export class UpdateConceptoMovimientoDto extends PartialType(CreateConceptoMovimientoDto) {}
