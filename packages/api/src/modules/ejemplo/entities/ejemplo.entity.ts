import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EjemploCategoria } from '@/modules/ejemplo-categoria/entities/ejemplo-categoria.entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Entity('ejemplo')
export class Ejemplo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 1000, nullable: true })
  descripcion: string;

  @Column({ name: 'fecha', type: 'varchar', length: 100, nullable: true })
  fecha: string;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'activo' })
  estado: string;

  @Column({ name: 'imagen_id', type: 'int', nullable: true })
  imagenId: number;

  @ManyToOne(() => Archivo, { nullable: true })
  @JoinColumn({ name: 'imagen_id' })
  imagen: Archivo;

  @Column({ name: 'ejemplo_categoria_id', type: 'int' })
  ejemploCategoriaId: number;

  @ManyToOne(() => EjemploCategoria)
  @JoinColumn({ name: 'ejemplo_categoria_id' })
  ejemploCategoria: EjemploCategoria;
}
