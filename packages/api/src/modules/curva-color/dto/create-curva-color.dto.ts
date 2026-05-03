import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCurvaColorDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  colorIds: number[];
}
