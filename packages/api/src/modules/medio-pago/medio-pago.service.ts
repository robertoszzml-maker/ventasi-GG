import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { MedioPago } from './entities/medio-pago.entity';
import { CreateMedioPagoDto } from './dto/create-medio-pago.dto';
import { UpdateMedioPagoDto } from './dto/update-medio-pago.dto';

@Injectable()
export class MedioPagoService {
  constructor(
    @InjectRepository(MedioPago)
    private repo: Repository<MedioPago>,
  ) {}

  async findAll(conditions: FindManyOptions<MedioPago>) {
    return this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      order: { orden: 'ASC', ...((conditions.order as object) ?? {}) },
    });
  }

  async findActivos() {
    return this.repo.find({ where: { activo: 1 }, order: { orden: 'ASC' } });
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async buscarPorCodigo(codigo: string) {
    const medio = await this.repo.findOne({ where: { codigo: codigo.toUpperCase() } });
    if (!medio || !medio.activo) throw new NotFoundException('Medio de pago no encontrado');
    return medio;
  }

  async create(dto: CreateMedioPagoDto) {
    dto.codigo = dto.codigo.toUpperCase();
    const existente = await this.repo.findOne({ where: { codigo: dto.codigo } });
    if (existente) throw new BadRequestException('Código duplicado');
    return this.repo.save(dto);
  }

  async update(id: number, dto: UpdateMedioPagoDto) {
    if (dto.codigo) {
      dto.codigo = dto.codigo.toUpperCase();
      const existente = await this.repo.findOne({ where: { codigo: dto.codigo } });
      if (existente && existente.id !== id) throw new BadRequestException('Código duplicado');
    }
    await this.repo.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException('Medio de pago no encontrado');
    await this.repo.update({ id }, { activo: 0 });
    return this.findOne(id);
  }
}
