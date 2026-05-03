import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVendedorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsOptional()
  activo?: number;
}
