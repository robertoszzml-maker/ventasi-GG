import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CurvaTalleDetalle } from './curva-talle-detalle.entity';

@Entity('curva_talle')
export class CurvaTalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => CurvaTalleDetalle, (detalle) => detalle.curva, { cascade: true })
  detalles: CurvaTalleDetalle[];
}
