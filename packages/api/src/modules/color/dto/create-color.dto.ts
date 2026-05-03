import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateColorDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  codigosHex?: string[];
}
