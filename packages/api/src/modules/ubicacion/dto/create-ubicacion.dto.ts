import { IsOptional, IsString } from 'class-validator';

export class CreateUbicacionDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
