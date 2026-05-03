import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';

export enum TipoArqueo {
  PARCIAL = 'parcial',
  CIERRE = 'cierre',
}

@Entity('arqueo_caja')
export class ArqueoCaja extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sesion_caja_id', type: 'int' })
  sesionCajaId: number;

  @ManyToOne(() => SesionCaja)
  @JoinColumn({ name: 'sesion_caja_id' })
  sesionCaja: SesionCaja;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @Column({ name: 'tipo', type: 'varchar', length: 20, default: TipoArqueo.PARCIAL })
  tipo: TipoArqueo;

  @Column({ name: 'fecha', type: 'varchar', length: 100 })
  fecha: string;

  @Column({ name: 'diferencia_total', type: 'varchar', length: 20, default: '0.0000' })
  diferenciaTotal: string;

  @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
  observaciones?: string;

  @OneToMany(() => ArqueoCajaDetalle, (d) => d.arqueoCaja, { cascade: true })
  detalles: ArqueoCajaDetalle[];
}

@Entity('arqueo_caja_detalle')
export class ArqueoCajaDetalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'arqueo_caja_id', type: 'int' })
  arqueoCajaId: number;

  @ManyToOne(() => ArqueoCaja, (a) => a.detalles)
  @JoinColumn({ name: 'arqueo_caja_id' })
  arqueoCaja: ArqueoCaja;

  @Column({ name: 'medio_pago_id', type: 'int' })
  medioPagoId: number;

  @Column({ name: 'monto_sistema', type: 'varchar', length: 20, default: '0.0000' })
  montoSistema: string;

  @Column({ name: 'monto_declarado', type: 'varchar', length: 20, default: '0.0000' })
  montoDeclarado: string;

  @Column({ name: 'diferencia', type: 'varchar', length: 20, default: '0.0000' })
  diferencia: string;
}
