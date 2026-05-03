import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { CurvaColor } from './entities/curva-color.entity';
import { CurvaColorDetalle } from './entities/curva-color-detalle.entity';
import { CreateCurvaColorDto } from './dto/create-curva-color.dto';
import { UpdateCurvaColorDto } from './dto/update-curva-color.dto';

@Injectable()
export class CurvaColorService {
  constructor(
    @InjectRepository(CurvaColor)
    private repo: Repository<CurvaColor>,
    @InjectRepository(CurvaColorDetalle)
    private detalleRepo: Repository<CurvaColorDetalle>
  ) {}

  async findAll(conditions: FindManyOptions<CurvaColor>): Promise<CurvaColor[]> {
    const qb = this.repo.createQueryBuilder('curvaColor');
    qb.leftJoinAndSelect('curvaColor.detalles', 'detalles');
    qb.leftJoinAndSelect('detalles.color', 'color');
    qb.leftJoinAndSelect('color.codigos', 'codigos');
    buildWhereAndOrderQuery(qb, conditions, 'curvaColor');
    return await qb.getMany();
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['detalles', 'detalles.color', 'detalles.color.codigos'],
    });
  }

  async create(dto: CreateCurvaColorDto) {
    const { colorIds, ...curvaData } = dto;
    const curva = await this.repo.save(curvaData);
    const detalles = colorIds.map((colorId, index) => ({
      curvaId: curva.id,
      colorId,
      orden: index,
    }));
    await this.detalleRepo.save(detalles);
    return await this.findOne(curva.id);
  }

  async update(id: number, dto: UpdateCurvaColorDto) {
    const { colorIds, ...curvaData } = dto;
    await this.repo.update({ id }, curvaData);
    if (colorIds !== undefined) {
      await this.actualizarColores(id, colorIds);
    }
    return await this.findOne(id);
  }

  async actualizarColores(id: number, colorIds: number[]) {
    await this.detalleRepo.delete({ curvaId: id });
    const detalles = colorIds.map((colorId, index) => ({
      curvaId: id,
      colorId,
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
