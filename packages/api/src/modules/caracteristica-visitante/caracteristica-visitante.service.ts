import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { CaracteristicaVisitante } from './entities/caracteristica-visitante.entity';
import { CreateCaracteristicaVisitanteDto } from './dto/create-caracteristica-visitante.dto';
import { UpdateCaracteristicaVisitanteDto } from './dto/update-caracteristica-visitante.dto';

@Injectable()
export class CaracteristicaVisitanteService {
  constructor(
    @InjectRepository(CaracteristicaVisitante)
    private repo: Repository<CaracteristicaVisitante>,
  ) {}

  async findAll(conditions: FindManyOptions<CaracteristicaVisitante>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async findActivas() {
    return await this.repo.find({ where: { activo: true }, order: { orden: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateCaracteristicaVisitanteDto) {
    const ultima = await this.repo.findOne({ where: {}, order: { orden: 'DESC' } });
    const orden = dto.orden ?? ((ultima?.orden ?? 0) + 1);
    return await this.repo.save({ ...dto, orden });
  }

  async update(id: number, dto: UpdateCaracteristicaVisitanteDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.softDelete({ id });
    return entity;
  }
}
