import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Familia } from '@/modules/familia/entities/familia.entity';

@Entity('grupo')
export class Grupo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'familia_id', type: 'int' })
  familiaId: number;

  @ManyToOne(() => Familia)
  @JoinColumn({ name: 'familia_id' })
  familia: Familia;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;
}
