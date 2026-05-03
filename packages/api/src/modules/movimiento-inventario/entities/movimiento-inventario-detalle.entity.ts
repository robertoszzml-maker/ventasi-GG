import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { ArticuloVariante } from '@/modules/articulo-variante/entities/articulo-variante.entity';

@Entity('movimiento_inventario_detalle')
export class MovimientoInventarioDetalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movimiento_id', type: 'int' })
  movimientoId: number;

  @ManyToOne(() => MovimientoInventario, (m) => m.detalles)
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: MovimientoInventario;

  @Column({ name: 'articulo_variante_id', type: 'int' })
  articuloVarianteId: number;

  @ManyToOne(() => ArticuloVariante)
  @JoinColumn({ name: 'articulo_variante_id' })
  articuloVariante: ArticuloVariante;

  @Column({ name: 'cantidad', type: 'varchar', length: 100, default: '0' })
  cantidad: string;

  @Column({ name: 'cantidad_anterior', type: 'varchar', length: 100, nullable: true })
  cantidadAnterior?: string;

  @Column({ name: 'cantidad_nueva', type: 'varchar', length: 100, nullable: true })
  cantidadNueva?: string;
}
