import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { TipoCobro, MarcaTarjeta, Procesador } from '../entities/medio-pago.entity';

export class CreateMedioPagoDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 4)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(TipoCobro)
  tipo: TipoCobro;

  @IsInt()
  @Min(1)
  cuotas: number;

  @IsOptional()
  @IsEnum(MarcaTarjeta)
  marcaTarjeta?: MarcaTarjeta;

  @IsOptional()
  @IsEnum(Procesador)
  procesador?: Procesador;

  @IsInt()
  @Min(0)
  orden: number;

  @IsOptional()
  @IsString()
  arancel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  plazoDias?: number;
}
