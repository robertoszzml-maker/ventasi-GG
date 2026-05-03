import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTalleDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}
