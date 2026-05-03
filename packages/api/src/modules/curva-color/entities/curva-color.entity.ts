import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CurvaColorDetalle } from './curva-color-detalle.entity';

@Entity('curva_color')
export class CurvaColor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => CurvaColorDetalle, (d) => d.curva, { cascade: true })
  detalles: CurvaColorDetalle[];
}
