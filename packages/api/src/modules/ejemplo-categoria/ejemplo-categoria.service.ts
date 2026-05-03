import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { EjemploCategoria } from './entities/ejemplo-categoria.entity';
import { CreateEjemploCategoriaDto } from './dto/create-ejemplo-categoria.dto';
import { UpdateEjemploCategoriaDto } from './dto/update-ejemplo-categoria.dto';

@Injectable()
export class EjemploCategoriaService {
  constructor(
    @InjectRepository(EjemploCategoria)
    private repo: Repository<EjemploCategoria>
  ) {}

  async findAll(conditions: FindManyOptions<EjemploCategoria>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateEjemploCategoriaDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateEjemploCategoriaDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete({ id });
  }
}
