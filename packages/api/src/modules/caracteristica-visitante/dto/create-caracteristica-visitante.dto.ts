import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCaracteristicaVisitanteDto {
  @IsString()
  nombre: string;

  @IsString()
  icono: string;

  @IsNumber()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
