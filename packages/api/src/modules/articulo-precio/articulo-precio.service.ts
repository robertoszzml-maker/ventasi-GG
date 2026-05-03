import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { percentageOf, sumCurrency } from '@/helpers/currency';
import { ArticuloPrecio } from './entities/articulo-precio.entity';
import { AplicarPorcentajeDto, UpdateArticuloPrecioDto, UpdatePrecioItemDto, UpdatePrecioLoteDto } from './dto/create-articulo-precio.dto';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { ListaPrecio } from '@/modules/lista-precio/entities/lista-precio.entity';

@Injectable()
export class ArticuloPrecioService {
  constructor(
    @InjectRepository(ArticuloPrecio)
    private repo: Repository<ArticuloPrecio>,
    @InjectRepository(Articulo)
    private articuloRepo: Repository<Articulo>,
    @InjectRepository(ListaPrecio)
    private listaPrecioRepo: Repository<ListaPrecio>,
    private dataSource: DataSource,
  ) {}

  async findPorArticulo(articuloId: number) {
    return await this.repo
      .createQueryBuilder('ap')
      .leftJoinAndSelect('ap.listaPrecio', 'listaPrecio')
      .where('ap.articuloId = :articuloId', { articuloId })
      .andWhere('ap.deletedAt IS NULL')
      .andWhere('listaPrecio.deletedAt IS NULL')
      .orderBy('listaPrecio.esDefault', 'DESC')
      .addOrderBy('listaPrecio.nombre', 'ASC')
      .getMany();
  }

  async findPorLista(listaPrecioId: number) {
    return await this.repo
      .createQueryBuilder('ap')
      .leftJoinAndSelect('ap.articulo', 'articulo')
      .leftJoinAndSelect('articulo.subgrupo', 'subgrupo')
      .leftJoinAndSelect('subgrupo.grupo', 'grupo')
      .leftJoinAndSelect('grupo.familia', 'familia')
      .where('ap.listaPrecioId = :listaPrecioId', { listaPrecioId })
      .andWhere('ap.deletedAt IS NULL')
      .andWhere('articulo.deletedAt IS NULL')
      .orderBy('articulo.nombre', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateArticuloPrecioDto) {
    this.validarPrecio(dto.precio);
    await this.repo.update({ id }, { precio: dto.precio });
    return await this.findOne(id);
  }

  async updateLote(dto: UpdatePrecioLoteDto) {
    for (const item of dto.items) {
      this.validarPrecio(item.precio);
    }

    return await this.dataSource.transaction(async (manager) => {
      let afectados = 0;
      for (const item of dto.items) {
        const resultado = await manager
          .createQueryBuilder()
          .insert()
          .into(ArticuloPrecio)
          .values({
            articuloId: item.articuloId,
            listaPrecioId: item.listaPrecioId,
            precio: item.precio,
          })
          .orUpdate(['precio'], ['articulo_id', 'lista_precio_id'])
          .execute();
        afectados += resultado.raw?.affectedRows ?? 1;
      }
      return { afectados };
    });
  }

  async aplicarPorcentaje(dto: AplicarPorcentajeDto) {
    if (dto.articuloIds.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos un artículo');
    }

    return await this.dataSource.transaction(async (manager) => {
      const precios = await manager
        .createQueryBuilder(ArticuloPrecio, 'ap')
        .where('ap.listaPrecioId = :listaPrecioId', { listaPrecioId: dto.listaPrecioId })
        .andWhere('ap.articuloId IN (:...articuloIds)', { articuloIds: dto.articuloIds })
        .andWhere('ap.deletedAt IS NULL')
        .getMany();

      for (const p of precios) {
        const nuevoPrecio = Math.max(0, sumCurrency(p.precio, percentageOf(p.precio, dto.porcentaje)));
        await manager.update(ArticuloPrecio, { id: p.id }, { precio: nuevoPrecio });
      }

      return { afectados: precios.length };
    });
  }

  private validarPrecio(precio: number) {
    if (precio < 0) {
      throw new BadRequestException('El precio no puede ser negativo');
    }
  }
}
