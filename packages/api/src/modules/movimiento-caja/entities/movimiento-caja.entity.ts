import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';
import { ConceptoMovimiento } from '@/modules/concepto-movimiento/entities/concepto-movimiento.entity';

export enum TipoMovimiento {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

@Entity('movimiento_caja')
export class MovimientoCaja extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sesion_caja_id', type: 'int' })
  sesionCajaId: number;

  @ManyToOne(() => SesionCaja, (s) => s.movimientos)
  @JoinColumn({ name: 'sesion_caja_id' })
  sesionCaja: SesionCaja;

  @Column({ name: 'tipo', type: 'varchar', length: 10 })
  tipo: TipoMovimiento;

  @Column({ name: 'concepto_movimiento_id', type: 'int', nullable: true })
  conceptoMovimientoId?: number;

  @ManyToOne(() => ConceptoMovimiento, { nullable: true })
  @JoinColumn({ name: 'concepto_movimiento_id' })
  conceptoMovimiento?: ConceptoMovimiento;

  @Column({ name: 'medio_pago_id', type: 'int', nullable: true })
  medioPagoId?: number;

  @Column({ name: 'monto', type: 'varchar', length: 20, default: '0.0000' })
  monto: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 500, nullable: true })
  descripcion?: string;

  @Column({ name: 'referencia_tipo', type: 'varchar', length: 50, nullable: true })
  referenciaTipo?: string;

  @Column({ name: 'referencia_id', type: 'int', nullable: true })
  referenciaId?: number;
}
