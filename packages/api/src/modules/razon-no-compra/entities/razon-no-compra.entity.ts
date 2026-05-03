import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubRazonNoCompra } from './sub-razon-no-compra.entity';

@Entity('razon_no_compra')
export class RazonNoCompra extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: boolean;

  @OneToMany(() => SubRazonNoCompra, (s) => s.razon, { cascade: true })
  subRazones: SubRazonNoCompra[];
}
