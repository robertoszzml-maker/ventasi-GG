import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '@/modules/cliente/entities/cliente.entity';
import { Vendedor } from '@/modules/vendedor/entities/vendedor.entity';
import { ListaPrecio } from '@/modules/lista-precio/entities/lista-precio.entity';
import { Usuario } from '@/modules/auth/usuario/entities/usuario.entity';
import { VentaDetalle } from './venta-detalle.entity';
import { Comprobante } from './comprobante.entity';

export enum EstadoVenta {
  BORRADOR = 'borrador',
  CONFIRMADA = 'confirmada',
  ANULADA = 'anulada',
}

export enum TipoOperacionVenta {
  VENTA = 'venta',
  NOTA_CREDITO = 'nota_credito',
  NOTA_DEBITO = 'nota_debito',
}

@Entity('venta')
export class Venta extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'visita_id', type: 'int', nullable: true })
  visitaId?: number;

  @Column({ name: 'cliente_id', type: 'int' })
  clienteId: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'vendedor_id', type: 'int' })
  vendedorId: number;

  @ManyToOne(() => Vendedor)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Vendedor;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'lista_precio_id', type: 'int' })
  listaPrecioId: number;

  @ManyToOne(() => ListaPrecio)
  @JoinColumn({ name: 'lista_precio_id' })
  listaPrecio: ListaPrecio;

  @Column({ name: 'tipo_comprobante', type: 'varchar', length: 10 })
  tipoComprobante: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: EstadoVenta.BORRADOR })
  estado: EstadoVenta;

  @Column({ name: 'tipo_operacion', type: 'varchar', length: 20, default: TipoOperacionVenta.VENTA })
  tipoOperacion: TipoOperacionVenta;

  @Column({ name: 'venta_origen_id', type: 'int', nullable: true })
  ventaOrigenId?: number;

  @Column({ name: 'sesion_caja_id', type: 'int', nullable: true })
  sesionCajaId?: number;

  @Column({ name: 'terminal_id', type: 'int', nullable: true })
  terminalId?: number;

  @Column({ name: 'fecha', type: 'varchar', length: 100 })
  fecha: string;

  @Column({ name: 'subtotal', type: 'varchar', length: 20, default: '0.0000' })
  subtotal: string;

  @Column({ name: 'descuento_porcentaje', type: 'varchar', length: 20, nullable: true })
  descuentoPorcentaje?: string;

  @Column({ name: 'descuento_monto', type: 'varchar', length: 20, nullable: true })
  descuentoMonto?: string;

  @Column({ name: 'recargo_porcentaje', type: 'varchar', length: 20, nullable: true })
  recargoPorcentaje?: string;

  @Column({ name: 'recargo_monto', type: 'varchar', length: 20, nullable: true })
  recargoMonto?: string;

  @Column({ name: 'base_imponible', type: 'varchar', length: 20, default: '0.0000' })
  baseImponible: string;

  @Column({ name: 'iva', type: 'varchar', length: 20, default: '0.0000' })
  iva: string;

  @Column({ name: 'total', type: 'varchar', length: 20, default: '0.0000' })
  total: string;

  @Column({ name: 'vuelto', type: 'varchar', length: 20, default: '0.0000' })
  vuelto: string;

  @OneToMany(() => VentaDetalle, (d) => d.venta, { cascade: true })
  detalles: VentaDetalle[];

  @OneToOne(() => Comprobante, (c) => c.venta)
  comprobante: Comprobante;
}
