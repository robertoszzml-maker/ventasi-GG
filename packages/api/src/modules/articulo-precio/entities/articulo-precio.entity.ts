import { BaseEntity } from '@/common/base.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { ListaPrecio } from '@/modules/lista-precio/entities/lista-precio.entity';

@Entity('articulo_precio')
export class ArticuloPrecio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_id', type: 'int' })
  articuloId: number;

  @ManyToOne(() => Articulo)
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column({ name: 'lista_precio_id', type: 'int' })
  listaPrecioId: number;

  @ManyToOne(() => ListaPrecio, (lp) => lp.precios)
  @JoinColumn({ name: 'lista_precio_id' })
  listaPrecio: ListaPrecio;

  @MoneyColumn({ name: 'precio', default: '0.0000' })
  precio: number;
}
