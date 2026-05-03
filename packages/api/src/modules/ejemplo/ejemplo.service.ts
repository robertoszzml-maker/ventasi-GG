import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Ejemplo } from './entities/ejemplo.entity';
import { CreateEjemploDto } from './dto/create-ejemplo.dto';
import { UpdateEjemploDto } from './dto/update-ejemplo.dto';

@Injectable()
export class EjemploService {
  constructor(
    @InjectRepository(Ejemplo)
    private repo: Repository<Ejemplo>
  ) {}

  async findAll(conditions: FindManyOptions<Ejemplo>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      relations: ['ejemploCategoria', 'imagen'],
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['ejemploCategoria', 'imagen'],
    });
  }

  async create(dto: CreateEjemploDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateEjemploDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete({ id });
  }
}
