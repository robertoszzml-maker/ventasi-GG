import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuloVarianteDto } from './create-articulo-variante.dto';

export class UpdateArticuloVarianteDto extends PartialType(CreateArticuloVarianteDto) {}
