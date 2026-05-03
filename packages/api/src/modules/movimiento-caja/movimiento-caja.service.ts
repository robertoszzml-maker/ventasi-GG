import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { MovimientoCaja, TipoMovimiento } from './entities/movimiento-caja.entity';
import { SesionCaja, EstadoSesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';

@Injectable()
export class MovimientoCajaService {
  private readonly logger = new Logger(MovimientoCajaService.name);

  constructor(
    @InjectRepository(MovimientoCaja)
    private repo: Repository<MovimientoCaja>,
    @InjectRepository(SesionCaja)
    private sesionRepo: Repository<SesionCaja>,
  ) {}

  async findAll(conditions: FindManyOptions<MovimientoCaja>) {
    const qb = this.repo.createQueryBuilder('movimientoCaja');
    qb.leftJoinAndSelect('movimientoCaja.conceptoMovimiento', 'conceptoMovimiento');
    buildWhereAndOrderQuery(qb, conditions, 'movimientoCaja');
    return await qb.getMany();
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['conceptoMovimiento'],
    });
  }

  async create(dto: CreateMovimientoCajaDto) {
    const sesion = await this.sesionRepo.findOne({ where: { id: dto.sesionCajaId } });
    if (!sesion || sesion.estado !== EstadoSesionCaja.ABIERTA) {
      throw new BadRequestException('No hay una sesión de caja abierta');
    }
    const movimiento = await this.repo.save(dto);
    return await this.findOne(movimiento.id);
  }

  async registrarDesdeVenta(payload: {
    ventaId: number;
    sesionCajaId: number;
    tipo: TipoMovimiento;
    medioPagoId: number;
    monto: string;
  }) {
    try {
      await this.repo.save({
        sesionCajaId: payload.sesionCajaId,
        tipo: payload.tipo,
        medioPagoId: payload.medioPagoId,
        monto: payload.monto,
        referenciaTipo: 'venta',
        referenciaId: payload.ventaId,
      });
    } catch (err) {
      this.logger.warn(`Error al registrar movimiento desde venta ${payload.ventaId}: ${err.message}`);
    }
  }
}
