import { PartialType } from '@nestjs/mapped-types';
import { CreateRazonNoCompraDto, CreateSubRazonNoCompraDto } from './create-razon-no-compra.dto';

export class UpdateRazonNoCompraDto extends PartialType(CreateRazonNoCompraDto) {}
export class UpdateSubRazonNoCompraDto extends PartialType(CreateSubRazonNoCompraDto) {}
