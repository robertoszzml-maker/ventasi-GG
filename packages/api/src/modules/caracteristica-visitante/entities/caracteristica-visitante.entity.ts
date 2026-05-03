import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('caracteristica_visitante')
export class CaracteristicaVisitante extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'icono', type: 'varchar', length: 100 })
  icono: string;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: boolean;
}
