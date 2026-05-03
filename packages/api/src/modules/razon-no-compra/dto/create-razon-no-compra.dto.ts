import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRazonNoCompraDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class CreateSubRazonNoCompraDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
