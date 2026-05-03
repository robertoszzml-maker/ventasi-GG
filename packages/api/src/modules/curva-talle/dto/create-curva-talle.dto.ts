import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCurvaTalleDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  talleIds: number[];
}
