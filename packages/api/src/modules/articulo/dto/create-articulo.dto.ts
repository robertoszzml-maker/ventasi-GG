import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateArticuloDto {
  @IsNumber()
  subgrupoId: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  codigo: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsString()
  codigoQr?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsString()
  alicuotaIva?: string;

  @IsOptional()
  @IsNumber()
  curvaId?: number;

  @IsOptional()
  @IsNumber()
  curvaColorId?: number;

  @IsOptional()
  @IsIn(['continuidad', 'temporada'])
  tipoContinuidad?: string;

  @IsOptional()
  @IsBoolean()
  esAncla?: boolean;
}
