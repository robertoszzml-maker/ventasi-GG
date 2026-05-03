import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import { Venta, EstadoVenta, TipoOperacionVenta } from './entities/venta.entity';
import { VentaDetalle } from './entities/venta-detalle.entity';
import { Comprobante, EstadoComprobante, TipoComprobante } from './entities/comprobante.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { MovimientoInventario, TipoMovimiento } from '@/modules/movimiento-inventario/entities/movimiento-inventario.entity';
import { MovimientoInventarioDetalle } from '@/modules/movimiento-inventario/entities/movimiento-inventario-detalle.entity';
import { StockPorUbicacion } from '@/modules/stock-por-ubicacion/entities/stock-por-ubicacion.entity';
import { Visita } from '@/modules/visita/entities/visita.entity';
import { Config } from '@/modules/config/entities/config.entity';

@Injectable()
export class VentaService {
  private readonly logger = new Logger(VentaService.name);

  constructor(
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private detalleRepo: Repository<VentaDetalle>,
    @InjectRepository(Comprobante)
    private comprobanteRepo: Repository<Comprobante>,
    @Inject('AFIP_SERVICE')
    private afipClient: ClientProxy,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(take: number, skip: number, filter?: string, order?: string) {
    const qb = this.ventaRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.cliente', 'cliente')
      .leftJoinAndSelect('v.vendedor', 'vendedor')
      .leftJoinAndSelect('v.comprobante', 'comprobante')
      .where('v.deletedAt IS NULL')
      .orderBy('v.fecha', 'DESC')
      .addOrderBy('v.id', 'DESC');

    if (filter) {
      const f = JSON.parse(filter);
      if (f.estado) qb.andWhere('v.estado = :estado', { estado: f.estado });
      if (f.clienteId) qb.andWhere('v.clienteId = :clienteId', { clienteId: f.clienteId });
      if (f.fechaDesde) qb.andWhere('v.fecha >= :fechaDesde', { fechaDesde: f.fechaDesde });
      if (f.fechaHasta) qb.andWhere('v.fecha <= :fechaHasta', { fechaHasta: f.fechaHasta });
      if (f.tipoOperacion) qb.andWhere('v.tipoOperacion = :tipoOperacion', { tipoOperacion: f.tipoOperacion });
    }

    if (take) qb.take(take);
    if (skip) qb.skip(skip);

    return qb.getMany();
  }

  async findOne(id: number) {
    const venta = await this.ventaRepo.findOne({
      where: { id },
      relations: [
        'cliente', 'vendedor', 'listaPrecio',
        'detalles', 'detalles.articuloVariante',
        'detalles.articuloVariante.talle',
        'detalles.articuloVariante.color',
        'detalles.articuloVariante.articulo',
        'comprobante',
      ],
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }

  async crear(dto: CreateVentaDto) {
    const ventaId = await this.dataSource.transaction(async (manager) => {
      const sesionActiva = await manager.query(
        `SELECT id FROM sesion_caja WHERE estado = 'abierta' AND deleted_at IS NULL LIMIT 1`,
      );
      if (!sesionActiva.length) {
        this.logger.warn('crear venta: no hay sesión de caja abierta');
      }

      const venta = manager.create(Venta, {
        visitaId: dto.visitaId ?? null,
        clienteId: dto.clienteId,
        vendedorId: dto.vendedorId,
        usuarioId: dto.usuarioId ?? 1,
        listaPrecioId: dto.listaPrecioId,
        tipoComprobante: dto.tipoComprobante,
        tipoOperacion: (dto.tipoOperacion as TipoOperacionVenta) ?? TipoOperacionVenta.VENTA,
        ventaOrigenId: dto.ventaOrigenId ?? null,
        sesionCajaId: sesionActiva[0]?.id ?? null,
        estado: EstadoVenta.BORRADOR,
        fecha: dto.fecha,
        subtotal: dto.subtotal,
        descuentoPorcentaje: dto.descuentoPorcentaje,
        descuentoMonto: dto.descuentoMonto,
        recargoPorcentaje: dto.recargoPorcentaje,
        recargoMonto: dto.recargoMonto,
        baseImponible: dto.baseImponible,
        iva: dto.iva,
        total: dto.total,
      });
      const ventaGuardada = await manager.save(Venta, venta);

      for (const d of dto.detalles) {
        await manager.save(VentaDetalle, { ...d, ventaId: ventaGuardada.id });
      }

      return ventaGuardada.id;
    });
    return this.findOne(ventaId);
  }

  async guardar(id: number, dto: CreateVentaDto) {
    const venta = await this.ventaRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.estado !== EstadoVenta.BORRADOR) {
      throw new BadRequestException('Solo se pueden editar ventas en estado borrador');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Venta, { id }, {
        clienteId: dto.clienteId,
        vendedorId: dto.vendedorId,
        listaPrecioId: dto.listaPrecioId,
        tipoComprobante: dto.tipoComprobante,
        fecha: dto.fecha,
        subtotal: dto.subtotal,
        descuentoPorcentaje: dto.descuentoPorcentaje,
        descuentoMonto: dto.descuentoMonto,
        recargoPorcentaje: dto.recargoPorcentaje,
        recargoMonto: dto.recargoMonto,
        baseImponible: dto.baseImponible,
        iva: dto.iva,
        total: dto.total,
      });

      await manager.softDelete(VentaDetalle, { ventaId: id });

      for (const d of dto.detalles) {
        await manager.save(VentaDetalle, { ...d, ventaId: id });
      }
    });
    return this.findOne(id);
  }

  async confirmar(id: number, responsableId: number) {
    const venta = await this.ventaRepo.findOne({
      where: { id },
      relations: ['detalles', 'detalles.articuloVariante'],
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.estado !== EstadoVenta.BORRADOR) {
      throw new BadRequestException('Solo se pueden confirmar ventas en estado borrador');
    }

    const cobros = await this.dataSource.query(
      `SELECT SUM(CAST(monto AS DECIMAL(15,4))) AS suma FROM cobro WHERE venta_id = ? AND deleted_at IS NULL`,
      [id],
    );
    const sumaCobros = parseFloat(cobros[0]?.suma ?? '0');
    const totalVenta = parseFloat(venta.total ?? '0');
    if (Math.abs(sumaCobros - totalVenta) > 0.01) {
      throw new BadRequestException('Monto cobrado no coincide con total de la venta');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Venta, { id }, { estado: EstadoVenta.CONFIRMADA });

      const ubicacion = await manager.query(
        `SELECT id FROM ubicacion WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 1`,
      );
      const procedenciaUbicacionId = ubicacion[0]?.id ?? null;

      const cantidadTotal = venta.detalles
        .reduce((sum, d) => sum + parseInt(d.cantidad || '0'), 0)
        .toString();

      const movimiento = manager.create(MovimientoInventario, {
        tipo: TipoMovimiento.VENTA,
        fecha: venta.fecha,
        descripcion: `Venta #${id}`,
        cantidadTotal,
        responsableId,
        procedenciaUbicacionId,
        destinoClienteId: venta.clienteId,
        ventaId: id,
      });
      const movimientoGuardado = await manager.save(MovimientoInventario, movimiento);

      for (const detalle of venta.detalles) {
        await manager.save(MovimientoInventarioDetalle, {
          movimientoId: movimientoGuardado.id,
          articuloVarianteId: detalle.articuloVarianteId,
          cantidad: detalle.cantidad,
        });

        if (procedenciaUbicacionId) {
          const stock = await manager.findOne(StockPorUbicacion, {
            where: {
              articuloVarianteId: detalle.articuloVarianteId,
              ubicacionId: procedenciaUbicacionId,
            },
          });
          if (stock) {
            const nueva = parseInt(stock.cantidad || '0') - parseInt(detalle.cantidad || '0');
            await manager.update(StockPorUbicacion,
              { articuloVarianteId: detalle.articuloVarianteId, ubicacionId: procedenciaUbicacionId },
              { cantidad: nueva.toString() },
            );
          }
        }
      }

      if (venta.visitaId) {
        await manager.update(Visita, { id: venta.visitaId }, { ventaId: id } as any);
      }
    });

    const cobrosConfirmados = await this.dataSource.query(
      `SELECT medio_pago_id, monto FROM cobro WHERE venta_id = ? AND deleted_at IS NULL`,
      [id],
    );
    this.eventEmitter.emit('venta.confirmada', {
      ventaId: id,
      tipoOperacion: venta.tipoOperacion ?? TipoOperacionVenta.VENTA,
      cobros: cobrosConfirmados.map((c: any) => ({
        medioPagoId: c.medio_pago_id,
        monto: c.monto,
      })),
    });

    return this.findOne(id);
  }

  async emitirManual(id: number, formatoDefault = 'a4') {
    const venta = await this.ventaRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.estado !== EstadoVenta.CONFIRMADA) {
      throw new BadRequestException('Solo se pueden emitir comprobantes de ventas confirmadas');
    }

    const existente = await this.comprobanteRepo.findOne({ where: { ventaId: id } });
    if (existente?.estado === EstadoComprobante.EMITIDO) {
      throw new BadRequestException('Esta venta ya tiene un comprobante emitido');
    }

    const puntoVenta = await this.getConfig('ARCA_PUNTO_VENTA', '0001');

    return await this.dataSource.transaction(async (manager) => {
      const resultado = await manager.query(
        `SELECT COALESCE(MAX(numero), 0) + 1 AS siguiente
         FROM comprobante
         WHERE tipo = 'manual'
           AND tipo_comprobante = ?
           AND punto_venta = ?
           AND deleted_at IS NULL
         FOR UPDATE`,
        [venta.tipoComprobante, puntoVenta],
      );
      const numero = resultado[0].siguiente;

      const now = new Date();
      const fechaEmision = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const comprobante = manager.create(Comprobante, {
        ventaId: id,
        tipo: TipoComprobante.MANUAL,
        tipoComprobante: venta.tipoComprobante,
        puntoVenta,
        numero,
        fechaEmision,
        estado: EstadoComprobante.EMITIDO,
        formatoDefault,
      });

      return await manager.save(Comprobante, comprobante);
    });
  }

  async emitirFiscal(id: number, formatoDefault = 'a4') {
    const venta = await this.ventaRepo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.estado !== EstadoVenta.CONFIRMADA) {
      throw new BadRequestException('Solo se pueden emitir comprobantes de ventas confirmadas');
    }

    const existente = await this.comprobanteRepo.findOne({ where: { ventaId: id } });
    if (existente?.estado === EstadoComprobante.EMITIDO) {
      throw new BadRequestException('Esta venta ya tiene un comprobante emitido');
    }

    const puntoVenta = await this.getConfig('ARCA_PUNTO_VENTA', '0001');
    const razonSocial = await this.getConfig('ARCA_RAZON_SOCIAL', '');

    const tipoCodigoArca = venta.tipoComprobante === 'A' ? 1 : 6;

    let ultimoNro = 0;
    try {
      const res = await firstValueFrom(
        this.afipClient.send('obtener-ultimo-comprobante', {
          puntoVenta: parseInt(puntoVenta),
          tipoComprobante: tipoCodigoArca,
        }),
      );
      ultimoNro = res.ultimoNro ?? 0;
    } catch {
      ultimoNro = 0;
    }

    const nroComprobante = ultimoNro + 1;
    const now = new Date();
    const fechaEmision = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    let comprobanteData: Partial<Comprobante> = {
      ventaId: id,
      tipo: TipoComprobante.FISCAL,
      tipoComprobante: venta.tipoComprobante,
      puntoVenta,
      numero: nroComprobante,
      fechaEmision: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      estado: EstadoComprobante.PENDIENTE_CAE,
      formatoDefault,
    };

    try {
      const respuestaArca = await firstValueFrom(
        this.afipClient.send('solicitar-cae', {
          puntoVenta: parseInt(puntoVenta),
          tipoComprobante: tipoCodigoArca,
          nroComprobante,
          fechaComprobante: fechaEmision,
          importeTotal: parseFloat(venta.total),
          importeNeto: parseFloat(venta.baseImponible),
          importeIva: parseFloat(venta.iva),
          cuitReceptor: venta.cliente?.cuit || '0',
          condicionIvaReceptor: venta.cliente?.condicionIva || 'CF',
          razonSocial,
        }),
      );

      if (respuestaArca.error) {
        comprobanteData.estado = EstadoComprobante.PENDIENTE_CAE;
        comprobanteData.datosArca = JSON.stringify(respuestaArca);
      } else {
        comprobanteData.estado = EstadoComprobante.EMITIDO;
        comprobanteData.cae = respuestaArca.cae;
        comprobanteData.caeVencimiento = respuestaArca.caeVencimiento;
        comprobanteData.datosArca = JSON.stringify(respuestaArca);
      }
    } catch (err) {
      comprobanteData.estado = EstadoComprobante.PENDIENTE_CAE;
      comprobanteData.datosArca = JSON.stringify({ error: true, mensaje: err?.message });
    }

    const comprobante = this.comprobanteRepo.create(comprobanteData);
    return await this.comprobanteRepo.save(comprobante);
  }

  async reintentar(id: number) {
    const comprobante = await this.comprobanteRepo.findOne({
      where: { ventaId: id },
      relations: ['venta', 'venta.cliente'],
    });
    if (!comprobante) throw new NotFoundException('Comprobante no encontrado');
    if (comprobante.estado !== EstadoComprobante.PENDIENTE_CAE) {
      throw new BadRequestException('Solo se puede reintentar comprobantes en estado pendiente_cae');
    }

    const venta = comprobante.venta;
    const tipoCodigoArca = venta.tipoComprobante === 'A' ? 1 : 6;

    try {
      const respuestaArca = await firstValueFrom(
        this.afipClient.send('solicitar-cae', {
          puntoVenta: parseInt(comprobante.puntoVenta),
          tipoComprobante: tipoCodigoArca,
          nroComprobante: comprobante.numero,
          fechaComprobante: (comprobante.fechaEmision || '').replace(/-/g, ''),
          importeTotal: parseFloat(venta.total),
          importeNeto: parseFloat(venta.baseImponible),
          importeIva: parseFloat(venta.iva),
          cuitReceptor: venta.cliente?.cuit || '0',
          condicionIvaReceptor: venta.cliente?.condicionIva || 'CF',
        }),
      );

      if (!respuestaArca.error) {
        await this.comprobanteRepo.update({ id: comprobante.id }, {
          estado: EstadoComprobante.EMITIDO,
          cae: respuestaArca.cae,
          caeVencimiento: respuestaArca.caeVencimiento,
          datosArca: JSON.stringify(respuestaArca),
        });
      } else {
        await this.comprobanteRepo.update({ id: comprobante.id }, {
          datosArca: JSON.stringify(respuestaArca),
        });
      }
    } catch (err) {
      await this.comprobanteRepo.update({ id: comprobante.id }, {
        datosArca: JSON.stringify({ error: true, mensaje: err?.message }),
      });
    }

    return this.comprobanteRepo.findOne({ where: { id: comprobante.id } });
  }

  async anular(id: number) {
    const venta = await this.ventaRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.estado === EstadoVenta.ANULADA) {
      throw new BadRequestException('La venta ya está anulada');
    }

    await this.ventaRepo.update({ id }, { estado: EstadoVenta.ANULADA });

    const comprobante = await this.comprobanteRepo.findOne({ where: { ventaId: id } });
    if (comprobante) {
      await this.comprobanteRepo.update({ id: comprobante.id }, { estado: EstadoComprobante.ANULADO });
    }

    return this.findOne(id);
  }

  private async getConfig(clave: string, defaultValue: string): Promise<string> {
    const config = await this.dataSource.getRepository(Config).findOne({ where: { clave } });
    return config?.valor || defaultValue;
  }
}
