import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArticuloVariante } from '@/modules/articulo-variante/entities/articulo-variante.entity';
import { Ubicacion } from '@/modules/ubicacion/entities/ubicacion.entity';

@Entity('stock_por_ubicacion')
export class StockPorUbicacion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_variante_id', type: 'int' })
  articuloVarianteId: number;

  @ManyToOne(() => ArticuloVariante)
  @JoinColumn({ name: 'articulo_variante_id' })
  articuloVariante: ArticuloVariante;

  @Column({ name: 'ubicacion_id', type: 'int' })
  ubicacionId: number;

  @ManyToOne(() => Ubicacion)
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion: Ubicacion;

  @Column({ name: 'cantidad', type: 'varchar', length: 100, default: '0' })
  cantidad: string;
}
