import { IsOptional, IsString } from 'class-validator';

export class CreateFamiliaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  silueta?: string;
}
