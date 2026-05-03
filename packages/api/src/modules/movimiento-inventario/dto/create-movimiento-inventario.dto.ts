import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TipoMovimiento } from '../entities/movimiento-inventario.entity';

export class DetalleMovimientoDto {
  @IsNumber()
  articuloVarianteId: number;

  /** Solo para variantes nuevas: talle + color para crear articulo_variante */
  @IsOptional()
  @IsNumber()
  articuloId?: number;

  @IsOptional()
  @IsNumber()
  talleId?: number;

  @IsOptional()
  @IsNumber()
  colorId?: number;

  @IsString()
  cantidad: string;

  /** Solo para ARREGLO */
  @IsOptional()
  @IsString()
  cantidadNueva?: string;
}

export class CreateMovimientoInventarioDto {
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  responsableId?: number;

  // Procedencia
  @IsOptional()
  @IsNumber()
  procedenciaUbicacionId?: number;

  @IsOptional()
  @IsNumber()
  procedenciaProveedorId?: number;

  @IsOptional()
  @IsNumber()
  procedenciaClienteId?: number;

  // Destino
  @IsOptional()
  @IsNumber()
  destinoUbicacionId?: number;

  @IsOptional()
  @IsNumber()
  destinoProveedorId?: number;

  @IsOptional()
  @IsNumber()
  destinoClienteId?: number;

  @IsOptional()
  @IsNumber()
  visitaId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleMovimientoDto)
  detalles: DetalleMovimientoDto[];
}
