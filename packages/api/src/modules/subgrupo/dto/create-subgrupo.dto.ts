import { IsNumber, IsString } from 'class-validator';

export class CreateSubgrupoDto {
  @IsNumber()
  grupoId: number;

  @IsString()
  nombre: string;
}
