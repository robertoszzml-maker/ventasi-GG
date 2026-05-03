import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoCobro {
  EFECTIVO = 'EFECTIVO',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
  QR = 'QR',
  TRANSFERENCIA = 'TRANSFERENCIA',
  APP_DELIVERY = 'APP_DELIVERY',
}

export enum MarcaTarjeta {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
  CABAL = 'CABAL',
  NARANJA = 'NARANJA',
  OTRA = 'OTRA',
}

export enum Procesador {
  MP = 'MP',
  CLOVER = 'CLOVER',
  OTRO = 'OTRO',
}

@Entity('medio_pago')
export class MedioPago extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo', type: 'varchar', length: 4, unique: true })
  codigo: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'tipo', type: 'varchar', length: 30 })
  tipo: TipoCobro;

  @Column({ name: 'cuotas', type: 'int', default: 1 })
  cuotas: number;

  @Column({ name: 'marca_tarjeta', type: 'varchar', length: 20, nullable: true })
  marcaTarjeta?: MarcaTarjeta;

  @Column({ name: 'procesador', type: 'varchar', length: 20, nullable: true })
  procesador?: Procesador;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: number;

  @Column({ name: 'arancel', type: 'varchar', length: 20, nullable: true })
  arancel?: string;

  @Column({ name: 'plazo_dias', type: 'int', nullable: true })
  plazoDias?: number;
}
