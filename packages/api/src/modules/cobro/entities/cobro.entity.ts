import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from '@/modules/venta/entities/venta.entity';
import { MedioPago, TipoCobro, MarcaTarjeta, Procesador } from '@/modules/medio-pago/entities/medio-pago.entity';

export enum EstadoCobro {
  PENDIENTE = 'PENDIENTE',
  ACREDITADO = 'ACREDITADO',
  PARCIAL = 'PARCIAL',
  CON_DIFERENCIA = 'CON_DIFERENCIA',
}

@Entity('cobro')
export class Cobro extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id', type: 'int' })
  ventaId: number;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'medio_pago_id', type: 'int' })
  medioPagoId: number;

  @ManyToOne(() => MedioPago)
  @JoinColumn({ name: 'medio_pago_id' })
  medioPago: MedioPago;

  @Column({ name: 'tipo', type: 'varchar', length: 30 })
  tipo: TipoCobro;

  @Column({ name: 'cuotas', type: 'int', default: 1 })
  cuotas: number;

  @Column({ name: 'marca_tarjeta', type: 'varchar', length: 20, nullable: true })
  marcaTarjeta?: MarcaTarjeta;

  @Column({ name: 'procesador', type: 'varchar', length: 20, nullable: true })
  procesador?: Procesador;

  @Column({ name: 'monto', type: 'varchar', length: 20, default: '0.0000' })
  monto: string;

  @Column({ name: 'codigo_autorizacion', type: 'varchar', length: 50, nullable: true })
  codigoAutorizacion?: string;

  @Column({ name: 'ultimos_4', type: 'varchar', length: 4, nullable: true })
  ultimos4?: string;

  @Column({ name: 'timestamp', type: 'varchar', length: 100 })
  timestamp: string;

  @Column({ name: 'estado', type: 'varchar', length: 30, default: EstadoCobro.PENDIENTE })
  estado: EstadoCobro;
}
