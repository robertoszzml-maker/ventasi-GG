import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  modulo?: string;
}
