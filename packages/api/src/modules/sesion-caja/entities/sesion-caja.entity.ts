import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Caja } from '@/modules/caja/entities/caja.entity';
import { MovimientoCaja } from '@/modules/movimiento-caja/entities/movimiento-caja.entity';

export enum EstadoSesionCaja {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
}

@Entity('sesion_caja')
export class SesionCaja extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'caja_id', type: 'int' })
  cajaId: number;

  @ManyToOne(() => Caja)
  @JoinColumn({ name: 'caja_id' })
  caja: Caja;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: EstadoSesionCaja.ABIERTA })
  estado: EstadoSesionCaja;

  @Column({ name: 'fecha_apertura', type: 'varchar', length: 100 })
  fechaApertura: string;

  @Column({ name: 'fecha_cierre', type: 'varchar', length: 100, nullable: true })
  fechaCierre?: string;

  @Column({ name: 'saldo_inicial_sugerido', type: 'varchar', length: 20, default: '0.0000' })
  saldoInicialSugerido: string;

  @Column({ name: 'saldo_inicial_confirmado', type: 'varchar', length: 20, default: '0.0000' })
  saldoInicialConfirmado: string;

  @Column({ name: 'sesion_anterior_id', type: 'int', nullable: true })
  sesionAnteriorId?: number;

  @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
  observaciones?: string;

  @OneToMany(() => MovimientoCaja, (m) => m.sesionCaja)
  movimientos: MovimientoCaja[];
}
