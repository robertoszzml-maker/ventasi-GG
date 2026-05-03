import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { ArqueoCaja, ArqueoCajaDetalle, TipoArqueo } from './entities/arqueo-caja.entity';
import { SesionCaja, EstadoSesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';
import { CreateArqueoCajaDto } from './dto/create-arqueo-caja.dto';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class ArqueoCajaService {
  constructor(
    @InjectRepository(ArqueoCaja)
    private arqueoRepo: Repository<ArqueoCaja>,
    @InjectRepository(ArqueoCajaDetalle)
    private detalleRepo: Repository<ArqueoCajaDetalle>,
    @InjectRepository(SesionCaja)
    private sesionRepo: Repository<SesionCaja>,
  ) {}

  async findAll(conditions: FindManyOptions<ArqueoCaja>) {
    const qb = this.arqueoRepo.createQueryBuilder('arqueoCaja');
    qb.leftJoinAndSelect('arqueoCaja.detalles', 'detalles');
    buildWhereAndOrderQuery(qb, conditions, 'arqueoCaja');
    return await qb.getMany();
  }

  async findOne(id: number) {
    return await this.arqueoRepo.findOne({
      where: { id },
      relations: ['detalles'],
    });
  }

  async create(dto: CreateArqueoCajaDto, usuarioId: number) {
    const sesion = await this.sesionRepo.findOne({ where: { id: dto.sesionCajaId } });
    if (!sesion || sesion.estado !== EstadoSesionCaja.ABIERTA) {
      throw new BadRequestException('No hay una sesión de caja abierta');
    }

    if (dto.tipo === TipoArqueo.CIERRE) {
      const yaHayCierre = await this.arqueoRepo.findOne({
        where: { sesionCajaId: dto.sesionCajaId, tipo: TipoArqueo.CIERRE },
      });
      if (yaHayCierre) {
        throw new BadRequestException('Ya existe un arqueo de cierre para esta sesión');
      }
    }

    const now = new Date();
    const fecha = now.toISOString();

    const detallesConSistema = await Promise.all(
      dto.detalles.map(async (d) => {
        const montoSistema = await this.calcularMontoSistemaPorMedio(dto.sesionCajaId, d.medioPagoId);
        const diferencia = (parseFloat(d.montoDeclarado) - parseFloat(montoSistema)).toFixed(4);
        return {
          medioPagoId: d.medioPagoId,
          montoSistema,
          montoDeclarado: d.montoDeclarado,
          diferencia,
        };
      }),
    );

    const diferenciaTotal = detallesConSistema
      .reduce((sum, d) => sum + parseFloat(d.diferencia), 0)
      .toFixed(4);

    const arqueo = await this.arqueoRepo.save({
      sesionCajaId: dto.sesionCajaId,
      usuarioId,
      tipo: dto.tipo,
      fecha,
      diferenciaTotal,
      observaciones: dto.observaciones,
    });

    for (const d of detallesConSistema) {
      await this.detalleRepo.save({ ...d, arqueoCajaId: arqueo.id });
    }

    return await this.findOne(arqueo.id);
  }

  private async calcularMontoSistemaPorMedio(sesionCajaId: number, medioPagoId: number): Promise<string> {
    const result = await this.arqueoRepo.manager.query(
      `SELECT
         SUM(CASE WHEN tipo = 'ingreso' THEN CAST(monto AS DECIMAL(15,4)) ELSE 0 END) -
         SUM(CASE WHEN tipo = 'egreso'  THEN CAST(monto AS DECIMAL(15,4)) ELSE 0 END) AS neto
       FROM movimiento_caja
       WHERE sesion_caja_id = ? AND medio_pago_id = ? AND deleted_at IS NULL`,
      [sesionCajaId, medioPagoId],
    );
    return result[0]?.neto != null ? parseFloat(result[0].neto).toFixed(4) : '0.0000';
  }
}
