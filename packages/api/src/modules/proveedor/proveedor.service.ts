import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private repo: Repository<Proveedor>,
  ) {}

  async findAll(conditions: FindManyOptions<Proveedor>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateProveedorDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateProveedorDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const tieneDependencias = await this.tieneDependencias(id);
    if (tieneDependencias) {
      throw new BadRequestException('No se puede eliminar el proveedor porque tiene movimientos asociados.');
    }
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }

  private async tieneDependencias(id: number): Promise<boolean> {
    const count = await this.repo.manager.query(
      `SELECT (
        (SELECT COUNT(*) FROM movimiento_inventario WHERE procedencia_proveedor_id = ? AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM movimiento_inventario WHERE destino_proveedor_id = ? AND deleted_at IS NULL)
      ) AS total`,
      [id, id],
    );
    return parseInt(count[0].total) > 0;
  }
}
