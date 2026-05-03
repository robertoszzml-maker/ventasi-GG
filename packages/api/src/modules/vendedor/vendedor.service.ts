import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { Vendedor } from './entities/vendedor.entity';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';

@Injectable()
export class VendedorService {
  constructor(
    @InjectRepository(Vendedor)
    private repo: Repository<Vendedor>,
  ) {}

  async findAll(conditions: FindManyOptions<Vendedor>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateVendedorDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateVendedorDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const tieneVentas = await this.tieneVentas(id);
    if (tieneVentas) {
      await this.repo.update({ id }, { activo: 0 });
      return await this.findOne(id);
    }
    const entity = await this.findOne(id);
    await this.repo.softDelete({ id });
    return entity;
  }

  private async tieneVentas(id: number): Promise<boolean> {
    const result = await this.repo.manager.query(
      `SELECT COUNT(*) AS total FROM venta WHERE vendedor_id = ? AND deleted_at IS NULL`,
      [id],
    );
    return parseInt(result[0].total) > 0;
  }
}
