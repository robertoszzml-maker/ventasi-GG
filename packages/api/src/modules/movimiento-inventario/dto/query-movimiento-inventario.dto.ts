import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoMovimiento } from '../entities/movimiento-inventario.entity';

export class QueryMovimientoInventarioDto {
  @IsOptional()
  @IsEnum(TipoMovimiento)
  tipo?: TipoMovimiento;

  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @IsOptional()
  @IsString()
  fechaHasta?: string;

  @IsOptional()
  @IsString()
  ubicacionId?: string;
}
