import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Color } from './entities/color.entity';
import { ColorCodigo } from './entities/color-codigo.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private repo: Repository<Color>,
    @InjectRepository(ColorCodigo)
    private codigoRepo: Repository<ColorCodigo>
  ) {}

  async findAll(conditions: FindManyOptions<Color>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      relations: ['codigos'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id }, relations: ['codigos'] });
  }

  async create(dto: CreateColorDto) {
    const { codigosHex, ...datos } = dto;
    const color = await this.repo.save(datos);
    if (codigosHex && codigosHex.length > 0) {
      await this.codigoRepo.save(
        codigosHex.map((hex, i) => ({ colorId: color.id, hex, orden: i }))
      );
    }
    return await this.findOne(color.id);
  }

  async update(id: number, dto: UpdateColorDto) {
    const { codigosHex, ...datos } = dto;
    await this.repo.update({ id }, datos);
    if (codigosHex !== undefined) {
      await this.codigoRepo.delete({ colorId: id });
      if (codigosHex.length > 0) {
        await this.codigoRepo.save(
          codigosHex.map((hex, i) => ({ colorId: id, hex, orden: i }))
        );
      }
    }
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }
}
