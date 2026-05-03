import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RazonNoCompra } from './razon-no-compra.entity';

@Entity('sub_razon_no_compra')
export class SubRazonNoCompra extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'razon_id', type: 'int' })
  razonId: number;

  @ManyToOne(() => RazonNoCompra, (r) => r.subRazones)
  @JoinColumn({ name: 'razon_id' })
  razon: RazonNoCompra;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: boolean;
}
