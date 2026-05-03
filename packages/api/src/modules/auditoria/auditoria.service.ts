import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { Auditoria } from './entities/auditoria.entity';
import { buildWhereAndOrderQuery, transformToGenericFilters } from '@/helpers/filter-utils';
import { InjectRepository } from '@nestjs/typeorm';
import { getToday, getTodayDateTime } from '@/helpers/date';
import { getUser } from '@/helpers/get-user';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) { }

  async create(createAuditoriaDto: CreateAuditoriaDto) {
    const user = getUser()
    createAuditoriaDto.fecha = getTodayDateTime()
    createAuditoriaDto.usuarioId = user.uid
    return await this.auditoriaRepository.save(createAuditoriaDto);
  }

  async findAll(conditions: FindManyOptions<Auditoria>): Promise<Auditoria[]> {
    const qb = this.auditoriaRepository.createQueryBuilder('auditoria');
    const relaciones = ['usuario',];
    for (const relation of relaciones) {
      qb.leftJoinAndSelect(`auditoria.${relation}`, relation.split('.').pop());
    }
    buildWhereAndOrderQuery(qb, conditions, 'auditoria');
    const presupuestos = await qb.getMany();


    return presupuestos;
  }
  async findOne(id: number) {
    return await this.auditoriaRepository.findOneBy({ id });
  }

  async update(id: number, updateAuditoriaDto: UpdateAuditoriaDto) {
    await this.auditoriaRepository.update({ id }, updateAuditoriaDto);
    return await this.auditoriaRepository.findOneBy({ id });
  }

  async remove(id: number) {

    const alquilerPrecio = await this.findOne(id);

    await this.auditoriaRepository.delete({ id });
    return alquilerPrecio
  }

  async findPresupuestoHistorial(registroId: number) {
    return await this.auditoriaRepository.find({
      where: {
        tabla: 'presupuesto',
        columna: 'procesoGeneralId',
        registroId,
      },
      relations: ['usuario'],
      order: {
        fecha: 'DESC',
      },
    });
  }

  /**
   * Obtiene la primera fecha en que una columna cambió a un valor específico
   * @param tabla - Nombre de la tabla auditada
   * @param columna - Nombre de la columna auditada
   * @param registroId - ID del registro auditado
   * @param valorNuevo - Valor nuevo al que cambió la columna
   * @returns La fecha del primer cambio o null si no se encontró
   */
  async obtenerPrimeraFechaCambioAValor(
    tabla: string,
    columna: string,
    registroId: number,
    valorNuevo: string | number,
  ): Promise<string | null> {
    const resultado = await this.auditoriaRepository.findOne({
      where: {
        tabla,
        columna,
        registroId,
        valorNuevo: String(valorNuevo),
      },
      order: {
        fecha: 'ASC',
      },
    });

    return resultado ? resultado.fecha : null;
  }
}
