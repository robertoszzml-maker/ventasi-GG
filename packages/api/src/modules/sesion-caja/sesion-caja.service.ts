import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { SesionCaja, EstadoSesionCaja } from './entities/sesion-caja.entity';
import { AbrirCajaDto, CerrarCajaDto } from './dto/create-sesion-caja.dto';

@Injectable()
export class SesionCajaService {
  private readonly logger = new Logger(SesionCajaService.name);

  constructor(
    @InjectRepository(SesionCaja)
    private repo: Repository<SesionCaja>,
  ) {}

  async getActiva() {
    const sesion = await this.repo.findOne({
      where: { estado: EstadoSesionCaja.ABIERTA },
      relations: ['caja'],
    });
    if (!sesion) return null;

    const totales = await this.calcularTotalesSesion(sesion.id);
    return { ...sesion, ...totales };
  }

  async abrir(dto: AbrirCajaDto, usuarioId: number) {
    const abierta = await this.repo.findOne({ where: { estado: EstadoSesionCaja.ABIERTA } });
    if (abierta) {
      throw new BadRequestException('Ya existe una sesión de caja abierta');
    }

    const { sugerido, anteriorId } = await this.calcularArrastre(dto.cajaId);

    const now = new Date();
    const fechaApertura = now.toISOString();

    const sesion = await this.repo.save({
      cajaId: dto.cajaId,
      usuarioId,
      estado: EstadoSesionCaja.ABIERTA,
      fechaApertura,
      saldoInicialSugerido: sugerido,
      saldoInicialConfirmado: dto.saldoInicialConfirmado,
      sesionAnteriorId: anteriorId,
      observaciones: dto.observaciones,
    });

    return await this.findOne(sesion.id);
  }

  async cerrar(sesionId: number, dto: CerrarCajaDto) {
    const sesion = await this.findOne(sesionId);
    if (!sesion) throw new BadRequestException('Sesión no encontrada');
    if (sesion.estado !== EstadoSesionCaja.ABIERTA) {
      throw new BadRequestException('La sesión ya está cerrada');
    }

    const tieneArqueoCierre = await this.repo.manager.query(
      `SELECT id FROM arqueo_caja WHERE sesion_caja_id = ? AND tipo = 'cierre' AND deleted_at IS NULL LIMIT 1`,
      [sesionId],
    );
    if (!tieneArqueoCierre.length) {
      throw new BadRequestException('Se requiere un arqueo de cierre antes de cerrar la sesión');
    }

    const now = new Date();
    await this.repo.update({ id: sesionId }, {
      estado: EstadoSesionCaja.CERRADA,
      fechaCierre: now.toISOString(),
      observaciones: dto.observaciones ?? sesion.observaciones,
    });

    return await this.findOne(sesionId);
  }

  async findAll(conditions: FindManyOptions<SesionCaja>) {
    const qb = this.repo.createQueryBuilder('sesionCaja');
    qb.leftJoinAndSelect('sesionCaja.caja', 'caja');
    buildWhereAndOrderQuery(qb, conditions, 'sesionCaja');
    return await qb.getMany();
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['caja'],
    });
  }

  async findOneConDetalle(id: number) {
    const sesion = await this.repo.findOne({
      where: { id },
      relations: ['caja', 'movimientos', 'movimientos.conceptoMovimiento'],
    });
    if (!sesion) return null;
    const totales = await this.calcularTotalesSesion(id);
    return { ...sesion, ...totales };
  }

  private async calcularArrastre(cajaId: number): Promise<{ sugerido: string; anteriorId: number | null }> {
    const anteriorResult = await this.repo.manager.query(
      `SELECT sc.id FROM sesion_caja sc
       WHERE sc.caja_id = ? AND sc.estado = 'cerrada' AND sc.deleted_at IS NULL
       ORDER BY sc.id DESC LIMIT 1`,
      [cajaId],
    );
    if (!anteriorResult.length) return { sugerido: '0.0000', anteriorId: null };

    const anteriorId = anteriorResult[0].id;

    const efectivoResult = await this.repo.manager.query(
      `SELECT acd.monto_declarado
       FROM arqueo_caja ac
       JOIN arqueo_caja_detalle acd ON acd.arqueo_caja_id = ac.id
       JOIN medio_pago mp ON mp.id = acd.medio_pago_id
       WHERE ac.sesion_caja_id = ? AND ac.tipo = 'cierre'
         AND mp.tipo = 'EFECTIVO' AND ac.deleted_at IS NULL
       LIMIT 1`,
      [anteriorId],
    );

    const sugerido = efectivoResult.length ? efectivoResult[0].monto_declarado : '0.0000';
    return { sugerido, anteriorId };
  }

  private async calcularTotalesSesion(sesionId: number) {
    const result = await this.repo.manager.query(
      `SELECT
         SUM(CASE WHEN tipo = 'ingreso' THEN CAST(monto AS DECIMAL(15,4)) ELSE 0 END) AS total_ingresos,
         SUM(CASE WHEN tipo = 'egreso'  THEN CAST(monto AS DECIMAL(15,4)) ELSE 0 END) AS total_egresos,
         COUNT(*) AS cantidad_movimientos
       FROM movimiento_caja
       WHERE sesion_caja_id = ? AND deleted_at IS NULL`,
      [sesionId],
    );
    return {
      totalIngresos: result[0]?.total_ingresos ?? '0.0000',
      totalEgresos: result[0]?.total_egresos ?? '0.0000',
      cantidadMovimientos: result[0]?.cantidad_movimientos ?? 0,
    };
  }
}
