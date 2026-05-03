import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RazonNoCompra } from './entities/razon-no-compra.entity';
import { SubRazonNoCompra } from './entities/sub-razon-no-compra.entity';
import { CreateRazonNoCompraDto, CreateSubRazonNoCompraDto } from './dto/create-razon-no-compra.dto';
import { UpdateRazonNoCompraDto, UpdateSubRazonNoCompraDto } from './dto/update-razon-no-compra.dto';

@Injectable()
export class RazonNoCompraService {
  constructor(
    @InjectRepository(RazonNoCompra)
    private repo: Repository<RazonNoCompra>,
    @InjectRepository(SubRazonNoCompra)
    private subRepo: Repository<SubRazonNoCompra>,
  ) {}

  async findAll() {
    return await this.repo.find({
      relations: ['subRazones'],
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async findActivas() {
    return await this.repo.find({
      where: { activo: true },
      relations: ['subRazones'],
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const razon = await this.repo.findOne({ where: { id }, relations: ['subRazones'] });
    if (!razon) throw new NotFoundException(`Razón ${id} no encontrada`);
    return razon;
  }

  async create(dto: CreateRazonNoCompraDto) {
    const ultima = await this.repo.findOne({ where: {}, order: { orden: 'DESC' } });
    const orden = dto.orden ?? ((ultima?.orden ?? 0) + 1);
    return await this.repo.save({ ...dto, orden });
  }

  async update(id: number, dto: UpdateRazonNoCompraDto) {
    if (dto.activo === false) {
      const activas = await this.repo.count({ where: { activo: true } });
      const actual = await this.findOne(id);
      if (actual?.activo && activas <= 1) {
        throw new BadRequestException('Debe existir al menos una razón activa');
      }
    }
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async createSubRazon(razonId: number, dto: CreateSubRazonNoCompraDto) {
    const ultima = await this.subRepo.findOne({ where: { razonId }, order: { orden: 'DESC' } });
    const orden = dto.orden ?? ((ultima?.orden ?? 0) + 1);
    return await this.subRepo.save({ ...dto, razonId, orden });
  }

  async updateSubRazon(id: number, dto: UpdateSubRazonNoCompraDto) {
    await this.subRepo.update({ id }, dto);
    return await this.subRepo.findOne({ where: { id } });
  }
}
