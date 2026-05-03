import { IsOptional, IsString } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  cuit?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
