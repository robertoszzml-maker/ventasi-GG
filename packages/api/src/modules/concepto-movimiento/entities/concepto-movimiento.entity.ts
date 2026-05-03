import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoConcepto {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

@Entity('concepto_movimiento')
export class ConceptoMovimiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ name: 'tipo', type: 'varchar', length: 10, default: TipoConcepto.EGRESO })
  tipo: TipoConcepto;

  @Column({ name: 'es_sistema', type: 'tinyint', default: 0 })
  esSistema: number;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: number;
}
