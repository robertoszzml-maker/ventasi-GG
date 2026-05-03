import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArticuloPrecio } from '@/modules/articulo-precio/entities/articulo-precio.entity';

@Entity('lista_precio')
export class ListaPrecio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'es_default', type: 'tinyint', default: 0 })
  esDefault: number;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: number;

  @OneToMany(() => ArticuloPrecio, (ap) => ap.listaPrecio)
  precios: ArticuloPrecio[];
}
