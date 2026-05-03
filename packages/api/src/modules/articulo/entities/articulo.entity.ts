import { BaseEntity } from '@/common/base.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, VirtualColumn } from 'typeorm';
import { Subgrupo } from '@/modules/subgrupo/entities/subgrupo.entity';
import { CurvaTalle } from '@/modules/curva-talle/entities/curva-talle.entity';
import { CurvaColor } from '@/modules/curva-color/entities/curva-color.entity';
import { ArticuloTalle } from './articulo-talle.entity';
import { ArticuloColor } from './articulo-color.entity';

@Entity('articulo')
export class Articulo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subgrupo_id', type: 'int' })
  subgrupoId: number;

  @ManyToOne(() => Subgrupo)
  @JoinColumn({ name: 'subgrupo_id' })
  subgrupo: Subgrupo;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'codigo', type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ name: 'sku', type: 'varchar', length: 80, unique: true })
  sku: string;

  @Column({ name: 'codigo_barras', type: 'varchar', length: 100, nullable: true })
  codigoBarras: string;

  @Column({ name: 'codigo_qr', type: 'varchar', length: 500, nullable: true })
  codigoQr: string;

  @MoneyColumn({ name: 'costo', default: '0.0000' })
  costo: number;

  @Column({ name: 'alicuota_iva', type: 'varchar', length: 10, default: '21' })
  alicuotaIva: string;

  @Column({ name: 'tipo_continuidad', type: 'varchar', length: 20, nullable: true })
  tipoContinuidad: string;

  @Column({ name: 'es_ancla', type: 'tinyint', default: 0 })
  esAncla: boolean;

  @Column({ name: 'curva_id', type: 'int', nullable: true })
  curvaId: number;

  @ManyToOne(() => CurvaTalle, { nullable: true })
  @JoinColumn({ name: 'curva_id' })
  curva: CurvaTalle;

  @Column({ name: 'curva_color_id', type: 'int', nullable: true })
  curvaColorId: number;

  @ManyToOne(() => CurvaColor, { nullable: true })
  @JoinColumn({ name: 'curva_color_id' })
  curvaColor: CurvaColor;

  @OneToMany(() => ArticuloTalle, (at) => at.articulo)
  talles: ArticuloTalle[];

  @OneToMany(() => ArticuloColor, (ac) => ac.articulo)
  colores: ArticuloColor[];

  @VirtualColumn({
    query: (alias) => `(
      SELECT COALESCE(SUM(CAST(spu.cantidad AS SIGNED)), 0)
      FROM articulo_variante av
      JOIN stock_por_ubicacion spu ON spu.articulo_variante_id = av.id AND spu.deleted_at IS NULL
      WHERE av.articulo_id = ${alias}.id AND av.deleted_at IS NULL
    )`,
  })
  stockTotal: number;
}
