import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Color } from '@/modules/color/entities/color.entity';

@Entity('articulo_color')
export class ArticuloColor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_id', type: 'int' })
  articuloId: number;

  @ManyToOne(() => Articulo, (a) => a.colores)
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column({ name: 'color_id', type: 'int' })
  colorId: number;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;
}
