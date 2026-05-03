import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoVisitante } from '../entities/visita.entity';

export class CreateVisitaDto {
  @IsEnum(TipoVisitante)
  tipoVisitante: TipoVisitante;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  caracteristicaIds?: number[];

  @IsNumber()
  @IsOptional()
  clienteId?: number;
}

export class ResolverCompraDto {
  @IsNumber()
  movimientoId: number;
}

export class ResolverNoCompraDto {
  @IsNumber()
  razonId: number;

  @IsNumber()
  @IsOptional()
  subRazonId?: number;

  @IsNumber()
  @IsOptional()
  articuloId?: number;

  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
