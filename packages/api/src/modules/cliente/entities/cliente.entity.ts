import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cliente')
export class Cliente extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  @Column({ name: 'cuit', type: 'varchar', length: 20, nullable: true, unique: true })
  cuit?: string;

  @Column({ name: 'condicion_iva', type: 'varchar', length: 20, nullable: true })
  condicionIva?: string;

  @Column({ name: 'domicilio', type: 'varchar', length: 255, nullable: true })
  domicilio?: string;

  @Column({ name: 'localidad', type: 'varchar', length: 100, nullable: true })
  localidad?: string;

  @Column({ name: 'provincia', type: 'varchar', length: 100, nullable: true })
  provincia?: string;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 10, nullable: true })
  codigoPostal?: string;
}
