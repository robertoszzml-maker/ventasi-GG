import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { ArticuloVariante } from '@/modules/articulo-variante/entities/articulo-variante.entity';

@Entity('venta_detalle')
export class VentaDetalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id', type: 'int' })
  ventaId: number;

  @ManyToOne(() => Venta, (v) => v.detalles)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'articulo_variante_id', type: 'int' })
  articuloVarianteId: number;

  @ManyToOne(() => ArticuloVariante)
  @JoinColumn({ name: 'articulo_variante_id' })
  articuloVariante: ArticuloVariante;

  @Column({ name: 'cantidad', type: 'varchar', length: 20, default: '0' })
  cantidad: string;

  @Column({ name: 'precio_unitario', type: 'varchar', length: 20, default: '0.0000' })
  precioUnitario: string;

  @Column({ name: 'descuento_porcentaje', type: 'varchar', length: 20, nullable: true })
  descuentoPorcentaje?: string;

  @Column({ name: 'descuento_monto', type: 'varchar', length: 20, nullable: true })
  descuentoMonto?: string;

  @Column({ name: 'subtotal_linea', type: 'varchar', length: 20, default: '0.0000' })
  subtotalLinea: string;
}
