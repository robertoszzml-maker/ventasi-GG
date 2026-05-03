import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Ubicacion } from '@/modules/ubicacion/entities/ubicacion.entity';
import { Proveedor } from '@/modules/proveedor/entities/proveedor.entity';
import { Cliente } from '@/modules/cliente/entities/cliente.entity';
import { Usuario } from '@/modules/auth/usuario/entities/usuario.entity';
import { MovimientoInventarioDetalle } from './movimiento-inventario-detalle.entity';

export enum TipoMovimiento {
  MOVIMIENTO = 'MOVIMIENTO',
  ARREGLO = 'ARREGLO',
  VENTA = 'VENTA',
}

@Entity('movimiento_inventario')
export class MovimientoInventario extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  tipo: TipoMovimiento;

  @Column({ name: 'fecha', type: 'varchar', length: 100 })
  fecha: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'cantidad_total', type: 'varchar', length: 100, default: '0' })
  cantidadTotal: string;

  @Column({ name: 'responsable_id', type: 'int', nullable: true })
  responsableId?: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'responsable_id' })
  responsable?: Usuario;

  // Procedencia
  @Column({ name: 'procedencia_ubicacion_id', type: 'int', nullable: true })
  procedenciaUbicacionId?: number;

  @ManyToOne(() => Ubicacion, { nullable: true })
  @JoinColumn({ name: 'procedencia_ubicacion_id' })
  procedenciaUbicacion?: Ubicacion;

  @Column({ name: 'procedencia_proveedor_id', type: 'int', nullable: true })
  procedenciaProveedorId?: number;

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'procedencia_proveedor_id' })
  procedenciaProveedor?: Proveedor;

  @Column({ name: 'procedencia_cliente_id', type: 'int', nullable: true })
  procedenciaClienteId?: number;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'procedencia_cliente_id' })
  procedenciaCliente?: Cliente;

  // Destino
  @Column({ name: 'destino_ubicacion_id', type: 'int', nullable: true })
  destinoUbicacionId?: number;

  @ManyToOne(() => Ubicacion, { nullable: true })
  @JoinColumn({ name: 'destino_ubicacion_id' })
  destinoUbicacion?: Ubicacion;

  @Column({ name: 'destino_proveedor_id', type: 'int', nullable: true })
  destinoProveedorId?: number;

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'destino_proveedor_id' })
  destinoProveedor?: Proveedor;

  @Column({ name: 'destino_cliente_id', type: 'int', nullable: true })
  destinoClienteId?: number;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'destino_cliente_id' })
  destinoCliente?: Cliente;

  @OneToMany(() => MovimientoInventarioDetalle, (d) => d.movimiento, { cascade: true })
  detalles: MovimientoInventarioDetalle[];

  @Column({ name: 'visita_id', type: 'int', nullable: true })
  visitaId?: number;

  @Column({ name: 'venta_id', type: 'int', nullable: true })
  ventaId?: number;
}
