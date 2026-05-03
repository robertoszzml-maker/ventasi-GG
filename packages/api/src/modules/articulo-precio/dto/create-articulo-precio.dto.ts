import { IsArray, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePrecioItemDto {
  @IsNumber()
  articuloId: number;

  @IsNumber()
  listaPrecioId: number;

  @IsNumber()
  @Min(0)
  precio: number;
}

export class UpdatePrecioLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePrecioItemDto)
  items: UpdatePrecioItemDto[];
}

export class AplicarPorcentajeDto {
  @IsNumber()
  listaPrecioId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  articuloIds: number[];

  @IsNumber()
  porcentaje: number;
}

export class UpdateArticuloPrecioDto {
  @IsNumber()
  @Min(0)
  precio: number;
}
