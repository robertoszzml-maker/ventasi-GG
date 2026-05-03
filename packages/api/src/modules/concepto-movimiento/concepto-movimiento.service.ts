import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { ConceptoMovimiento } from './entities/concepto-movimiento.entity';
import { CreateConceptoMovimientoDto } from './dto/create-concepto-movimiento.dto';
import { UpdateConceptoMovimientoDto } from './dto/update-concepto-movimiento.dto';

@Injectable()
export class ConceptoMovimientoService {
  constructor(
    @InjectRepository(ConceptoMovimiento)
    private repo: Repository<ConceptoMovimiento>,
  ) {}

  async findAll(conditions: FindManyOptions<ConceptoMovimiento>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findActivos() {
    return await this.repo.find({ where: { activo: 1 }, order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateConceptoMovimientoDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateConceptoMovimientoDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    if (entity?.esSistema) {
      throw new BadRequestException('Los conceptos del sistema no se pueden eliminar');
    }
    await this.repo.delete({ id });
    return entity;
  }
}
