import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { multiplyCurrency, sumCurrency, percentageOf } from '@/helpers/currency';
import { ListaPrecio } from './entities/lista-precio.entity';
import { CreateListaPrecioDto, ModoInicializacion } from './dto/create-lista-precio.dto';
import { UpdateListaPrecioDto } from './dto/update-lista-precio.dto';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { ArticuloPrecio } from '@/modules/articulo-precio/entities/articulo-precio.entity';

@Injectable()
export class ListaPrecioService {
  constructor(
    @InjectRepository(ListaPrecio)
    private repo: Repository<ListaPrecio>,
    @InjectRepository(ArticuloPrecio)
    private articuloPrecioRepo: Repository<ArticuloPrecio>,
    @InjectRepository(Articulo)
    private articuloRepo: Repository<Articulo>,
    private dataSource: DataSource,
  ) {}

  async findAll(conditions: FindManyOptions<ListaPrecio>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where),
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateListaPrecioDto, usuarioTieneCosto: boolean) {
    const existing = await this.repo.findOne({ where: { nombre: dto.nombre } });
    if (existing) {
      throw new ConflictException(`Ya existe una lista con el nombre "${dto.nombre}"`);
    }

    if (dto.modo === ModoInicializacion.DESDE_COSTO && !usuarioTieneCosto) {
      throw new ForbiddenException('No tiene permiso para inicializar desde costo');
    }

    return await this.dataSource.transaction(async (manager) => {
      const lista = await manager.save(ListaPrecio, {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        esDefault: 0,
        activo: 1,
      });

      const articulos = await manager.find(Articulo, { where: { deletedAt: null } });

      const precios = await this.calcularPreciosIniciales(articulos, dto, lista.id, manager);

      if (precios.length > 0) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(ArticuloPrecio)
          .values(precios)
          .execute();
      }

      return lista;
    });
  }

  private async calcularPreciosIniciales(
    articulos: Articulo[],
    dto: CreateListaPrecioDto,
    nuevaListaId: number,
    manager: any,
  ): Promise<Partial<ArticuloPrecio>[]> {
    const modo = dto.modo ?? ModoInicializacion.CERO;

    if (modo === ModoInicializacion.CERO || articulos.length === 0) {
      return articulos.map((a) => ({
        articuloId: a.id,
        listaPrecioId: nuevaListaId,
        precio: 0,
      }));
    }

    if (modo === ModoInicializacion.COPIAR || modo === ModoInicializacion.PORCENTAJE) {
      if (!dto.listaOrigenId) {
        throw new BadRequestException('Se requiere listaOrigenId para este modo de inicialización');
      }
      const preciosOrigen = await manager.find(ArticuloPrecio, {
        where: { listaPrecioId: dto.listaOrigenId, deletedAt: null },
      });
      const mapaOrigen = new Map(preciosOrigen.map((p) => [p.articuloId, p.precio]));

      return articulos.map((a) => {
        const base = Number(mapaOrigen.get(a.id) ?? 0);
        const precio = modo === ModoInicializacion.PORCENTAJE
          ? Math.max(0, sumCurrency(base, percentageOf(base, dto.porcentaje ?? 0)))
          : base;
        return { articuloId: a.id, listaPrecioId: nuevaListaId, precio };
      });
    }

    if (modo === ModoInicializacion.DESDE_COSTO) {
      const factorCosto = dto.factor ?? 1;
      return articulos.map((a) => {
        const costo = Number((a as any).costo ?? 0);
        const precio = Math.max(0, multiplyCurrency(costo, factorCosto));
        return { articuloId: a.id, listaPrecioId: nuevaListaId, precio };
      });
    }

    return [];
  }

  async update(id: number, dto: UpdateListaPrecioDto) {
    const lista = await this.findOne(id);
    if (!lista) throw new BadRequestException('Lista no encontrada');

    if (dto.nombre && dto.nombre !== lista.nombre) {
      const existing = await this.repo.findOne({ where: { nombre: dto.nombre } });
      if (existing) throw new ConflictException(`Ya existe una lista con el nombre "${dto.nombre}"`);
    }

    if (dto.activo === 0 && lista.esDefault === 1) {
      throw new BadRequestException('No se puede desactivar la lista por defecto');
    }

    if (dto.esDefault === 1) {
      await this.repo.update({ esDefault: 1 }, { esDefault: 0 });
    }

    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const lista = await this.findOne(id);
    if (!lista) throw new BadRequestException('Lista no encontrada');
    if (lista.esDefault === 1) throw new BadRequestException('No se puede eliminar la lista por defecto');
    await this.repo.delete({ id });
    return lista;
  }

  async inicializarParaArticulo(articuloId: number): Promise<void> {
    const listas = await this.repo.find({ where: { activo: 1, deletedAt: null } });
    if (listas.length === 0) return;

    const valores = listas.map((l) => ({
      articuloId,
      listaPrecioId: l.id,
      precio: 0,
    }));

    await this.articuloPrecioRepo
      .createQueryBuilder()
      .insert()
      .into(ArticuloPrecio)
      .values(valores)
      .orIgnore()
      .execute();
  }
}
