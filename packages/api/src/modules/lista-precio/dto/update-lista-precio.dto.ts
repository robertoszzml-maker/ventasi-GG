import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateListaPrecioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  esDefault?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  activo?: number;
}
