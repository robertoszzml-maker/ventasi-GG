import { PartialType } from '@nestjs/mapped-types';
import { CreateEjemploDto } from './create-ejemplo.dto';

export class UpdateEjemploDto extends PartialType(CreateEjemploDto) {}
