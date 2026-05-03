import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum ModoInicializacion {
  CERO = 'CERO',
  COPIAR = 'COPIAR',
  PORCENTAJE = 'PORCENTAJE',
  DESDE_COSTO = 'DESDE_COSTO',
}

export class CreateListaPrecioDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(ModoInicializacion)
  modo?: ModoInicializacion;

  @IsOptional()
  @IsNumber()
  listaOrigenId?: number;

  @IsOptional()
  @IsNumber()
  porcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  factor?: number;
}
