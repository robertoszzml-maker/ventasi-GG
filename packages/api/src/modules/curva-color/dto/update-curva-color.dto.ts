import { PartialType } from '@nestjs/mapped-types';
import { CreateCurvaColorDto } from './create-curva-color.dto';

export class UpdateCurvaColorDto extends PartialType(CreateCurvaColorDto) {}
