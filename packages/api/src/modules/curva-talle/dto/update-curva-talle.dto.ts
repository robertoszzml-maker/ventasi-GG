import { PartialType } from '@nestjs/mapped-types';
import { CreateCurvaTalleDto } from './create-curva-talle.dto';

export class UpdateCurvaTalleDto extends PartialType(CreateCurvaTalleDto) {}
