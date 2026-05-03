import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArticuloVarianteDto {
  @IsNumber()
  articuloId: number;

  @IsNumber()
  talleId: number;

  @IsNumber()
  colorId: number;

  @IsString()
  cantidad: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;
}
