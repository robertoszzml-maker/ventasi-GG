import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from './venta.entity';

export enum TipoComprobante {
  FISCAL = 'fiscal',
  MANUAL = 'manual',
}

export enum EstadoComprobante {
  PENDIENTE = 'pendiente',
  PENDIENTE_CAE = 'pendiente_cae',
  EMITIDO = 'emitido',
  ANULADO = 'anulado',
  ERROR = 'error',
}

@Entity('comprobante')
export class Comprobante extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id', type: 'int', unique: true })
  ventaId: number;

  @OneToOne(() => Venta, (v) => v.comprobante)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'tipo', type: 'varchar', length: 10 })
  tipo: TipoComprobante;

  @Column({ name: 'tipo_comprobante', type: 'varchar', length: 10 })
  tipoComprobante: string;

  @Column({ name: 'punto_venta', type: 'varchar', length: 10, default: '0001' })
  puntoVenta: string;

  @Column({ name: 'numero', type: 'int', nullable: true })
  numero?: number;

  @Column({ name: 'fecha_emision', type: 'varchar', length: 100, nullable: true })
  fechaEmision?: string;

  @Column({ name: 'cae', type: 'varchar', length: 50, nullable: true })
  cae?: string;

  @Column({ name: 'cae_vencimiento', type: 'varchar', length: 100, nullable: true })
  caeVencimiento?: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: EstadoComprobante.PENDIENTE })
  estado: EstadoComprobante;

  @Column({ name: 'formato_default', type: 'varchar', length: 10, default: 'a4' })
  formatoDefault: string;

  @Column({ name: 'datos_arca', type: 'text', nullable: true })
  datosArca?: string;
}
