import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColorCodigo } from './color-codigo.entity';

@Entity('color')
export class Color extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo', type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => ColorCodigo, (c) => c.color, { cascade: true })
  codigos: ColorCodigo[];
}
