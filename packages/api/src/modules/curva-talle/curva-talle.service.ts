import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { CurvaTalle } from './entities/curva-talle.entity';
import { CurvaTalleDetalle } from './entities/curva-talle-detalle.entity';
import { CreateCurvaTalleDto } from './dto/create-curva-talle.dto';
import { UpdateCurvaTalleDto } from './dto/update-curva-talle.dto';

@Injectable()
export class CurvaTalleService {
  constructor(
    @InjectRepository(CurvaTalle)
    private repo: Repository<CurvaTalle>,
    @InjectRepository(CurvaTalleDetalle)
    private detalleRepo: Repository<CurvaTalleDetalle>
  ) {}

  async findAll(conditions: FindManyOptions<CurvaTalle>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      relations: ['detalles', 'detalles.talle'],
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['detalles', 'detalles.talle'],
    });
  }

  async create(dto: CreateCurvaTalleDto) {
    const { talleIds, ...curvaData } = dto;
    const curva = await this.repo.save(curvaData);
    const detalles = talleIds.map((talleId, index) => ({
      curvaId: curva.id,
      talleId,
      orden: index,
    }));
    await this.detalleRepo.save(detalles);
    return await this.findOne(curva.id);
  }

  async update(id: number, dto: UpdateCurvaTalleDto) {
    const { talleIds, ...curvaData } = dto;
    await this.repo.update({ id }, curvaData);
    if (talleIds !== undefined) {
      await this.actualizarTalles(id, talleIds);
    }
    return await this.findOne(id);
  }

  async actualizarTalles(id: number, talleIds: number[]) {
    await this.detalleRepo.delete({ curvaId: id });
    const detalles = talleIds.map((talleId, index) => ({
      curvaId: id,
      talleId,
      orden: index,
    }));
    await this.detalleRepo.save(detalles);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
