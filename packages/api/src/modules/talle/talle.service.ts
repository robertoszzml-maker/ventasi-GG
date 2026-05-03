import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Talle } from './entities/talle.entity';
import { CreateTalleDto } from './dto/create-talle.dto';
import { UpdateTalleDto } from './dto/update-talle.dto';

@Injectable()
export class TalleService {
  constructor(
    @InjectRepository(Talle)
    private repo: Repository<Talle>
  ) {}

  async findAll(conditions: FindManyOptions<Talle>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateTalleDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateTalleDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
