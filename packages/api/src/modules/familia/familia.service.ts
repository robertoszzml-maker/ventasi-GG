import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Familia } from './entities/familia.entity';
import { CreateFamiliaDto } from './dto/create-familia.dto';
import { UpdateFamiliaDto } from './dto/update-familia.dto';

@Injectable()
export class FamiliaService {
  constructor(
    @InjectRepository(Familia)
    private repo: Repository<Familia>
  ) {}

  async findAll(conditions: FindManyOptions<Familia>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateFamiliaDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateFamiliaDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
