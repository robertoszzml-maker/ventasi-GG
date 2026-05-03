import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Grupo } from '@/modules/grupo/entities/grupo.entity';

@Entity('subgrupo')
export class Subgrupo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id', type: 'int' })
  grupoId: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;
}
