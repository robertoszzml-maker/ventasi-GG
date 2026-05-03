import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CurvaColor } from './curva-color.entity';
import { Color } from '@/modules/color/entities/color.entity';

@Entity('curva_color_detalle')
export class CurvaColorDetalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curva_id', type: 'int' })
  curvaId: number;

  @ManyToOne(() => CurvaColor, (c) => c.detalles)
  @JoinColumn({ name: 'curva_id' })
  curva: CurvaColor;

  @Column({ name: 'color_id', type: 'int' })
  colorId: number;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;
}
