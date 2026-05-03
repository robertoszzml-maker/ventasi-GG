import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getTodayDateTime } from '@/helpers/date';
import { Cobro, EstadoCobro } from './entities/cobro.entity';
import { MedioPago, TipoCobro } from '@/modules/medio-pago/entities/medio-pago.entity';
import { CreateCobroDto } from './dto/create-cobro.dto';
import { Venta } from '@/modules/venta/entities/venta.entity';

@Injectable()
export class CobroService {
  constructor(
    @InjectRepository(Cobro)
    private cobroRepo: Repository<Cobro>,
    @InjectRepository(MedioPago)
    private medioPagoRepo: Repository<MedioPago>,
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,
  ) {}

  async crear(dto: CreateCobroDto) {
    const medio = await this.medioPagoRepo.findOne({ where: { id: dto.medioPagoId } });
    if (!medio || !medio.activo) throw new NotFoundException('Medio de pago no encontrado');

    if ((medio.tipo === TipoCobro.CREDITO || medio.tipo === TipoCobro.DEBITO) && !dto.codigoAutorizacion) {
      throw new BadRequestException(`Autorización obligatoria para ${medio.tipo.toLowerCase()}`);
    }

    const cobro = this.cobroRepo.create({
      ventaId: dto.ventaId,
      medioPagoId: dto.medioPagoId,
      tipo: medio.tipo,
      cuotas: medio.cuotas,
      marcaTarjeta: medio.marcaTarjeta,
      procesador: medio.procesador,
      monto: dto.monto,
      codigoAutorizacion: dto.codigoAutorizacion,
      ultimos4: dto.ultimos4,
      timestamp: getTodayDateTime(),
      estado: EstadoCobro.PENDIENTE,
    });

    if (dto.vuelto) {
      await this.ventaRepo.update({ id: dto.ventaId }, { vuelto: dto.vuelto });
    }

    return this.cobroRepo.save(cobro);
  }

  async listarPorVenta(ventaId: number) {
    const cobros = await this.cobroRepo.find({
      where: { ventaId, deletedAt: null },
      relations: ['medioPago'],
      order: { createdAt: 'ASC' },
    });

    const sumaMontos = cobros.reduce((acc, c) => acc + parseFloat(c.monto || '0'), 0);

    return { cobros, sumaMontos: sumaMontos.toFixed(4) };
  }

  async eliminar(id: number) {
    const cobro = await this.cobroRepo.findOne({ where: { id } });
    if (!cobro) throw new NotFoundException('Cobro no encontrado');
    await this.cobroRepo.softDelete({ id });
    return cobro;
  }
}
