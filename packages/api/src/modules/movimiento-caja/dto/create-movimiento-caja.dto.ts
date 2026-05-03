import { TipoMovimiento } from '../entities/movimiento-caja.entity';

export class CreateMovimientoCajaDto {
  sesionCajaId: number;
  tipo: TipoMovimiento;
  conceptoMovimientoId?: number;
  medioPagoId?: number;
  monto: string;
  descripcion?: string;
  referenciaTipo?: string;
  referenciaId?: number;
}
