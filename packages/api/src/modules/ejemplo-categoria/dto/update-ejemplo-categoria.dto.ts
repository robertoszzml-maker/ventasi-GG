import { PartialType } from '@nestjs/mapped-types';
import { CreateEjemploCategoriaDto } from './create-ejemplo-categoria.dto';

export class UpdateEjemploCategoriaDto extends PartialType(CreateEjemploCategoriaDto) {}
