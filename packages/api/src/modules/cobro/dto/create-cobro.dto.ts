import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min, ValidateIf } from 'class-validator';
import { TipoCobro, MarcaTarjeta, Procesador } from '@/modules/medio-pago/entities/medio-pago.entity';

export class CreateCobroDto {
  @IsInt()
  ventaId: number;

  @IsInt()
  medioPagoId: number;

  @IsString()
  @IsNotEmpty()
  monto: string;

  @IsOptional()
  @IsString()
  vuelto?: string;

  @ValidateIf((o) => o.tipo === TipoCobro.CREDITO || o.tipo === TipoCobro.DEBITO)
  @IsString()
  @IsNotEmpty({ message: 'Autorización obligatoria para crédito/débito' })
  codigoAutorizacion?: string;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  ultimos4?: string;
}
