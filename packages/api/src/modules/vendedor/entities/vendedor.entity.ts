import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vendedor')
export class Vendedor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'dni', type: 'varchar', length: 20, nullable: true })
  dni?: string;

  @Column({ name: 'codigo', type: 'varchar', length: 30, unique: true })
  codigo: string;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: number;
}
