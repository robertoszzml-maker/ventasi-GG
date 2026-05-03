import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEjemploDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsIn(['activo', 'inactivo'])
  @IsOptional()
  estado?: string;

  @IsInt()
  @IsOptional()
  imagenId?: number;

  @IsInt()
  @IsNotEmpty()
  ejemploCategoriaId: number;
}
