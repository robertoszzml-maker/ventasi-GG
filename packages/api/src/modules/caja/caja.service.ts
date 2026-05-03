import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Caja } from './entities/caja.entity';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(Caja)
    private repo: Repository<Caja>,
  ) {}

  async findAll(conditions: FindManyOptions<Caja>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateCajaDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateCajaDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
