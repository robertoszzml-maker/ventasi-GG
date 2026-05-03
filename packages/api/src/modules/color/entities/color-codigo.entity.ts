import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Color } from './color.entity';

@Entity('color_codigo')
export class ColorCodigo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'color_id', type: 'int' })
  colorId: number;

  @ManyToOne(() => Color, (c) => c.codigos)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ name: 'hex', type: 'varchar', length: 7 })
  hex: string;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;
}
