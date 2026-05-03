import { PartialType } from '@nestjs/mapped-types';
import { CreatePadronDto } from './create-padron.dto';

export class UpdatePadronDto extends PartialType(CreatePadronDto) {
  id: number;
}
