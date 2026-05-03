import { IsNumber, IsString } from 'class-validator';

export class CreateGrupoDto {
  @IsNumber()
  familiaId: number;

  @IsString()
  nombre: string;
}
