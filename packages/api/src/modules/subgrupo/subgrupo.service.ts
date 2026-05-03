import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Subgrupo } from './entities/subgrupo.entity';
import { CreateSubgrupoDto } from './dto/create-subgrupo.dto';
import { UpdateSubgrupoDto } from './dto/update-subgrupo.dto';

@Injectable()
export class SubgrupoService {
  constructor(
    @InjectRepository(Subgrupo)
    private repo: Repository<Subgrupo>
  ) {}

  async findAll(conditions: FindManyOptions<Subgrupo>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      relations: ['grupo', 'grupo.familia'],
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['grupo', 'grupo.familia'],
    });
  }

  async create(dto: CreateSubgrupoDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateSubgrupoDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
