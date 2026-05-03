import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoCaja, TipoMovimiento } from './entities/movimiento-caja.entity';
import { SesionCaja, EstadoSesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';

export interface VentaConfirmadaEvent {
  ventaId: number;
  tipoOperacion: string;
  cobros: Array<{
    medioPagoId: number;
    monto: string;
  }>;
}

@Injectable()
export class MovimientoCajaListener {
  private readonly logger = new Logger(MovimientoCajaListener.name);

  constructor(
    @InjectRepository(MovimientoCaja)
    private movimientoRepo: Repository<MovimientoCaja>,
    @InjectRepository(SesionCaja)
    private sesionRepo: Repository<SesionCaja>,
  ) {}

  @OnEvent('venta.confirmada')
  async handleVentaConfirmada(event: VentaConfirmadaEvent) {
    const sesion = await this.sesionRepo.findOne({ where: { estado: EstadoSesionCaja.ABIERTA } });
    if (!sesion) {
      this.logger.warn(`venta.confirmada(${event.ventaId}): sin sesión de caja activa — movimiento omitido`);
      return;
    }

    const tipo = event.tipoOperacion === 'nota_credito' ? TipoMovimiento.EGRESO : TipoMovimiento.INGRESO;

    for (const cobro of event.cobros) {
      try {
        await this.movimientoRepo.save({
          sesionCajaId: sesion.id,
          tipo,
          medioPagoId: cobro.medioPagoId,
          monto: cobro.monto,
          referenciaTipo: 'venta',
          referenciaId: event.ventaId,
        });
      } catch (err) {
        this.logger.error(`Error al registrar movimiento para venta ${event.ventaId}: ${err.message}`);
      }
    }
  }
}
