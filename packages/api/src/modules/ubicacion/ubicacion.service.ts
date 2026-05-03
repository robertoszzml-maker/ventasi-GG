import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Ubicacion } from './entities/ubicacion.entity';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';

@Injectable()
export class UbicacionService {
  constructor(
    @InjectRepository(Ubicacion)
    private repo: Repository<Ubicacion>,
  ) {}

  async findAll(conditions: FindManyOptions<Ubicacion>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateUbicacionDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateUbicacionDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const tieneDependencias = await this.tieneDependencias(id);
    if (tieneDependencias) {
      throw new BadRequestException('No se puede eliminar la ubicación porque tiene movimientos o stock asociado.');
    }
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }

  private async tieneDependencias(id: number): Promise<boolean> {
    const count = await this.repo.manager.query(
      `SELECT (
        (SELECT COUNT(*) FROM movimiento_inventario WHERE procedencia_ubicacion_id = ? AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM movimiento_inventario WHERE destino_ubicacion_id = ? AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM stock_por_ubicacion WHERE ubicacion_id = ? AND deleted_at IS NULL)
      ) AS total`,
      [id, id, id],
    );
    return parseInt(count[0].total) > 0;
  }
}
