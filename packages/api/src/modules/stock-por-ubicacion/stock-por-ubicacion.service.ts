import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockPorUbicacion } from './entities/stock-por-ubicacion.entity';

@Injectable()
export class StockPorUbicacionService {
  constructor(
    @InjectRepository(StockPorUbicacion)
    private repo: Repository<StockPorUbicacion>,
  ) {}

  async findByArticulo(articuloId: number) {
    return await this.repo
      .createQueryBuilder('spu')
      .innerJoinAndSelect('spu.articuloVariante', 'variante')
      .innerJoinAndSelect('variante.talle', 'talle')
      .innerJoinAndSelect('variante.color', 'color')
      .innerJoinAndSelect('spu.ubicacion', 'ubicacion')
      .where('variante.articuloId = :articuloId', { articuloId })
      .andWhere('spu.deletedAt IS NULL')
      .andWhere('variante.deletedAt IS NULL')
      .getMany();
  }

  async findByUbicacion(ubicacionId: number) {
    return await this.repo
      .createQueryBuilder('spu')
      .innerJoinAndSelect('spu.articuloVariante', 'variante')
      .innerJoinAndSelect('variante.articulo', 'articulo')
      .innerJoinAndSelect('variante.talle', 'talle')
      .innerJoinAndSelect('variante.color', 'color')
      .where('spu.ubicacionId = :ubicacionId', { ubicacionId })
      .andWhere('spu.deletedAt IS NULL')
      .andWhere('variante.deletedAt IS NULL')
      .getMany();
  }

  async getStock(articuloVarianteId: number, ubicacionId: number): Promise<StockPorUbicacion | null> {
    return await this.repo.findOne({
      where: { articuloVarianteId, ubicacionId },
    });
  }
}
