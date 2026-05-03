import { BaseEntity } from '@/common/base.entity';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { Usuario } from '@/modules/auth/usuario/entities/usuario.entity';
import { Cliente } from '@/modules/cliente/entities/cliente.entity';
import { MovimientoInventario } from '@/modules/movimiento-inventario/entities/movimiento-inventario.entity';
import { RazonNoCompra } from '@/modules/razon-no-compra/entities/razon-no-compra.entity';
import { SubRazonNoCompra } from '@/modules/razon-no-compra/entities/sub-razon-no-compra.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CaracteristicaVisitante } from '@/modules/caracteristica-visitante/entities/caracteristica-visitante.entity';

export enum TipoVisitante {
  MUJER = 'MUJER',
  HOMBRE = 'HOMBRE',
  ADULTO_MAYOR = 'ADULTO_MAYOR',
  JOVEN = 'JOVEN',
  PAREJA = 'PAREJA',
  FAMILIA = 'FAMILIA',
  GRUPO = 'GRUPO',
}

export enum EstadoVisita {
  PENDIENTE = 'PENDIENTE',
  COMPRA = 'COMPRA',
  NO_COMPRA = 'NO_COMPRA',
}

@Entity('visita')
export class Visita extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha', type: 'varchar', length: 100 })
  fecha: string;

  @Column({ name: 'hora', type: 'varchar', length: 8 })
  hora: string;

  @Column({ name: 'tipo_visitante', type: 'varchar', length: 20 })
  tipoVisitante: TipoVisitante;

  @Column({ name: 'estado', type: 'varchar', length: 15, default: EstadoVisita.PENDIENTE })
  estado: EstadoVisita;

  @Column({ name: 'movimiento_id', type: 'int', nullable: true })
  movimientoId?: number;

  @ManyToOne(() => MovimientoInventario, { nullable: true })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento?: MovimientoInventario;

  @Column({ name: 'venta_id', type: 'int', nullable: true })
  ventaId?: number;

  @Column({ name: 'razon_id', type: 'int', nullable: true })
  razonId?: number;

  @ManyToOne(() => RazonNoCompra, { nullable: true })
  @JoinColumn({ name: 'razon_id' })
  razon?: RazonNoCompra;

  @Column({ name: 'sub_razon_id', type: 'int', nullable: true })
  subRazonId?: number;

  @ManyToOne(() => SubRazonNoCompra, { nullable: true })
  @JoinColumn({ name: 'sub_razon_id' })
  subRazon?: SubRazonNoCompra;

  @Column({ name: 'articulo_id', type: 'int', nullable: true })
  articuloId?: number;

  @ManyToOne(() => Articulo, { nullable: true })
  @JoinColumn({ name: 'articulo_id' })
  articulo?: Articulo;

  @Column({ name: 'cliente_id', type: 'int', nullable: true })
  clienteId?: number;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente?: Cliente;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToMany(() => CaracteristicaVisitante)
  @JoinTable({
    name: 'visita_caracteristica',
    joinColumn: { name: 'visita_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'caracteristica_id', referencedColumnName: 'id' },
  })
  caracteristicas: CaracteristicaVisitante[];
}
