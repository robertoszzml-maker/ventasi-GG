import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CurvaTalle } from './curva-talle.entity';
import { Talle } from '@/modules/talle/entities/talle.entity';

@Entity('curva_talle_detalle')
export class CurvaTalleDetalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curva_id', type: 'int' })
  curvaId: number;

  @ManyToOne(() => CurvaTalle, (curva) => curva.detalles)
  @JoinColumn({ name: 'curva_id' })
  curva: CurvaTalle;

  @Column({ name: 'talle_id', type: 'int' })
  talleId: number;

  @ManyToOne(() => Talle)
  @JoinColumn({ name: 'talle_id' })
  talle: Talle;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;
}
