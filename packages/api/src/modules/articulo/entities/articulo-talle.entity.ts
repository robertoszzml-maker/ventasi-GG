import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Talle } from '@/modules/talle/entities/talle.entity';

@Entity('articulo_talle')
export class ArticuloTalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_id', type: 'int' })
  articuloId: number;

  @ManyToOne(() => Articulo, (articulo) => articulo.talles)
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column({ name: 'talle_id', type: 'int' })
  talleId: number;

  @ManyToOne(() => Talle)
  @JoinColumn({ name: 'talle_id' })
  talle: Talle;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;
}
