import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConfigDto {
  @IsNotEmpty()
  @IsString()
  clave: string;

  @IsOptional()
  @IsString()
  valor?: string;

  @IsOptional()
  @IsString()
  modulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  tipo?: string; // 'string', 'number', 'boolean', 'json'
}
