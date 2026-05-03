import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { Articulo } from './entities/articulo.entity';
import { ArticuloTalle } from './entities/articulo-talle.entity';
import { ArticuloColor } from './entities/articulo-color.entity';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { ListaPrecioService } from '@/modules/lista-precio/lista-precio.service';
import { calcularEstadoSemaforo, EstadoSemaforo } from '@/modules/articulo-variante/semaforo.helper';

@Injectable()
export class ArticuloService {
  constructor(
    @InjectRepository(Articulo)
    private repo: Repository<Articulo>,
    @InjectRepository(ArticuloTalle)
    private talleRepo: Repository<ArticuloTalle>,
    @InjectRepository(ArticuloColor)
    private colorRepo: Repository<ArticuloColor>,
    private dataSource: DataSource,
    private listaPrecioService: ListaPrecioService,
  ) {}

  async findAll(conditions: FindManyOptions<Articulo>, puedeVerCosto: boolean, search?: string): Promise<Articulo[]> {
    const qb = this.repo.createQueryBuilder('articulo');
    qb.leftJoinAndSelect('articulo.subgrupo', 'subgrupo');
    qb.leftJoinAndSelect('subgrupo.grupo', 'grupo');
    qb.leftJoinAndSelect('grupo.familia', 'familia');
    qb.addSelect(
      `(SELECT ap.precio FROM articulo_precio ap
        INNER JOIN lista_precio lp ON lp.id = ap.lista_precio_id
        WHERE ap.articulo_id = articulo.id
          AND ap.deleted_at IS NULL
          AND lp.es_default = 1
          AND lp.deleted_at IS NULL
        LIMIT 1)`,
      'precioDefault',
    );
    buildWhereAndOrderQuery(qb, conditions, 'articulo');
    if (search) {
      const s = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(articulo.nombre) LIKE :s OR LOWER(articulo.codigo) LIKE :s OR LOWER(articulo.sku) LIKE :s)',
        { s },
      );
    }
    const { entities, raw } = await qb.getRawAndEntities();
    return entities.map((a, i) => Object.assign(
      this.ocultarCosto(a, puedeVerCosto),
      { precioDefault: raw[i]?.precioDefault != null ? parseFloat(String(raw[i].precioDefault)) : undefined },
    ));
  }

  async buscarPorBarcode(codigoBarras: string, listaPrecioId?: number) {
    const filas: any[] = await this.dataSource.query(
      `SELECT
         v.id          AS varianteId,
         v.articulo_id AS articuloId,
         v.talle_id    AS talleId,
         v.color_id    AS colorId,
         t.codigo      AS talleCodigo,
         c.codigo      AS colorCodigo,
         a.nombre      AS articuloNombre,
         a.sku         AS articuloSku,
         (SELECT ap.precio
          FROM articulo_precio ap
          INNER JOIN lista_precio lp ON lp.id = ap.lista_precio_id AND lp.deleted_at IS NULL
          WHERE ap.articulo_id = a.id
            AND ap.deleted_at IS NULL
            AND lp.id = COALESCE(?, (SELECT id FROM lista_precio WHERE es_default = 1 AND deleted_at IS NULL LIMIT 1))
          LIMIT 1) AS precio
       FROM articulo_variante v
       JOIN articulo a ON a.id = v.articulo_id AND a.deleted_at IS NULL
       JOIN talle t    ON t.id = v.talle_id    AND t.deleted_at IS NULL
       JOIN color c    ON c.id = v.color_id    AND c.deleted_at IS NULL
       WHERE v.codigo_barras = ? AND v.deleted_at IS NULL
       LIMIT 1`,
      [listaPrecioId ?? null, codigoBarras],
    );

    if (!filas.length) return null;
    const f = filas[0];
    return {
      varianteId: f.varianteId as number,
      articuloId: f.articuloId as number,
      talleId: f.talleId as number,
      colorId: f.colorId as number,
      talleCodigo: f.talleCodigo as string,
      colorCodigo: f.colorCodigo as string,
      articuloNombre: f.articuloNombre as string,
      articuloSku: f.articuloSku as string,
      precio: f.precio != null ? parseFloat(String(f.precio)) : null,
    };
  }

  async findOne(id: number, puedeVerCosto = false) {
    const articulo = await this.repo.findOne({
      where: { id },
      relations: [
        'subgrupo', 'subgrupo.grupo', 'subgrupo.grupo.familia',
        'curva', 'curvaColor',
        'talles', 'talles.talle',
        'colores', 'colores.color', 'colores.color.codigos',
      ],
    });
    if (!articulo) return null;
    return this.ocultarCosto(articulo, puedeVerCosto);
  }

  async create(dto: CreateArticuloDto, puedeVerCosto: boolean, puedeEditarCosto: boolean) {
    if (dto.costo !== undefined && !puedeEditarCosto) {
      throw new ForbiddenException('No tiene permiso para establecer el costo');
    }

    const payload: Partial<Articulo> = {
      subgrupoId: dto.subgrupoId,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      codigo: dto.codigo,
      sku: dto.sku,
      codigoBarras: dto.codigoBarras,
      codigoQr: dto.codigoQr,
      curvaId: dto.curvaId,
      curvaColorId: dto.curvaColorId,
    };
    if (puedeEditarCosto && dto.costo !== undefined) {
      payload.costo = dto.costo;
    }

    return await this.dataSource.transaction(async (manager) => {
      const articulo = await manager.save(Articulo, payload);

      if (dto.curvaId) {
        await manager.query(
          `INSERT INTO articulo_talle (articulo_id, talle_id, orden, created_at, updated_at)
           SELECT ?, talle_id, orden, NOW(6), NOW(6)
           FROM curva_talle_detalle
           WHERE curva_id = ? AND deleted_at IS NULL`,
          [articulo.id, dto.curvaId]
        );
      }

      if (dto.curvaColorId) {
        await manager.query(
          `INSERT INTO articulo_color (articulo_id, color_id, orden, created_at, updated_at)
           SELECT ?, color_id, orden, NOW(6), NOW(6)
           FROM curva_color_detalle
           WHERE curva_id = ? AND deleted_at IS NULL`,
          [articulo.id, dto.curvaColorId]
        );
      }

      await this.listaPrecioService.inicializarParaArticulo(articulo.id);

      return this.ocultarCosto(await this.findOneRaw(articulo.id), puedeVerCosto);
    });
  }

  async update(id: number, dto: UpdateArticuloDto, puedeVerCosto: boolean, puedeEditarCosto: boolean) {
    if (dto.costo !== undefined && !puedeEditarCosto) {
      throw new ForbiddenException('No tiene permiso para modificar el costo');
    }

    const payload: Partial<Articulo> = { ...dto };
    if (!puedeEditarCosto) delete (payload as any).costo;

    await this.repo.update({ id }, payload);
    return this.ocultarCosto(await this.findOneRaw(id), puedeVerCosto);
  }

  async remove(id: number) {
    const entity = await this.findOneRaw(id);
    await this.repo.delete({ id });
    return entity;
  }

  async agregarTalle(articuloId: number, talleId: number, orden?: number) {
    const existente = await this.talleRepo.findOne({ where: { articuloId, talleId } });
    if (!existente) {
      const maxOrden = await this.talleRepo.count({ where: { articuloId } });
      await this.talleRepo.save({ articuloId, talleId, orden: orden ?? maxOrden });
    }
    return await this.findOneRaw(articuloId);
  }

  async agregarColor(articuloId: number, colorId: number, orden?: number) {
    const existente = await this.colorRepo.findOne({ where: { articuloId, colorId } });
    if (!existente) {
      const maxOrden = await this.colorRepo.count({ where: { articuloId } });
      await this.colorRepo.save({ articuloId, colorId, orden: orden ?? maxOrden });
    }
    return await this.findOneRaw(articuloId);
  }

  private async findOneRaw(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: [
        'subgrupo', 'subgrupo.grupo', 'subgrupo.grupo.familia',
        'curva', 'curvaColor',
        'talles', 'talles.talle',
        'colores', 'colores.color', 'colores.color.codigos',
      ],
    });
  }

  async getVariantesParaEtiquetas(articuloIds: number[]) {
    if (!articuloIds.length) return [];
    const placeholders = articuloIds.map(() => '?').join(',');
    const filas: any[] = await this.dataSource.query(
      `SELECT
        a.id     AS articuloId,
        a.nombre AS articuloNombre,
        v.id     AS varianteId,
        t.nombre AS talleNombre,
        c.nombre AS colorNombre,
        v.codigo_barras AS codigoBarras
       FROM articulo a
       JOIN articulo_variante v ON v.articulo_id = a.id AND v.deleted_at IS NULL
       JOIN talle t ON t.id = v.talle_id AND t.deleted_at IS NULL
       JOIN color c ON c.id = v.color_id AND c.deleted_at IS NULL
       WHERE a.id IN (${placeholders}) AND a.deleted_at IS NULL
       ORDER BY a.nombre, t.nombre, c.nombre`,
      articuloIds,
    );
    return filas.map((f) => ({
      articuloId: f.articuloId,
      articuloNombre: f.articuloNombre,
      varianteId: f.varianteId,
      talleNombre: f.talleNombre,
      colorNombre: f.colorNombre,
      codigoBarras: f.codigoBarras ?? null,
    }));
  }

  async getDashboardAnclas() {
    const filas: any[] = await this.dataSource.query(
      `SELECT
        a.id              AS articulo_id,
        a.nombre          AS articulo_nombre,
        a.codigo          AS articulo_codigo,
        a.tipo_continuidad,
        v.id              AS variante_id,
        t.id              AS talle_id,
        t.codigo          AS talle_codigo,
        t.nombre          AS talle_nombre,
        c.id              AS color_id,
        c.codigo          AS color_codigo,
        c.nombre          AS color_nombre,
        v.stock_minimo,
        v.stock_seguridad,
        v.stock_maximo,
        CAST(COALESCE(SUM(CAST(spu.cantidad AS SIGNED)), 0) AS SIGNED) AS stock_actual
       FROM articulo a
       JOIN articulo_variante v  ON v.articulo_id = a.id AND v.deleted_at IS NULL
       JOIN talle t              ON t.id = v.talle_id AND t.deleted_at IS NULL
       JOIN color c              ON c.id = v.color_id AND c.deleted_at IS NULL
       LEFT JOIN stock_por_ubicacion spu ON spu.articulo_variante_id = v.id AND spu.deleted_at IS NULL
       WHERE a.es_ancla = 1 AND a.deleted_at IS NULL
       GROUP BY a.id, a.nombre, a.codigo, a.tipo_continuidad,
                v.id, t.id, t.codigo, t.nombre,
                c.id, c.codigo, c.nombre,
                v.stock_minimo, v.stock_seguridad, v.stock_maximo
       ORDER BY a.nombre, t.nombre, c.nombre`
    );

    const prioridadEstado: Record<EstadoSemaforo, number> = {
      ROJO: 0, AMARILLO: 1, VERDE: 2, SIN_ESTADO: 3,
    };

    const articulosMap = new Map<number, any>();
    for (const fila of filas) {
      if (!articulosMap.has(fila.articulo_id)) {
        articulosMap.set(fila.articulo_id, {
          id: fila.articulo_id,
          nombre: fila.articulo_nombre,
          codigo: fila.articulo_codigo,
          tipoContinuidad: fila.tipo_continuidad,
          variantes: [],
          stockTotal: 0,
          estadoAgregado: 'SIN_ESTADO' as EstadoSemaforo,
        });
      }
      const articulo = articulosMap.get(fila.articulo_id);
      const stockActual = Number(fila.stock_actual) || 0;
      const minimo = fila.stock_minimo != null ? Number(fila.stock_minimo) : null;
      const seguridad = fila.stock_seguridad != null ? Number(fila.stock_seguridad) : null;
      const estadoVariante = calcularEstadoSemaforo(stockActual, minimo, seguridad);

      articulo.variantes.push({
        id: fila.variante_id,
        talleCodigo: fila.talle_codigo,
        talleNombre: fila.talle_nombre,
        colorCodigo: fila.color_codigo,
        colorNombre: fila.color_nombre,
        stockMinimo: minimo,
        stockSeguridad: seguridad,
        stockMaximo: fila.stock_maximo != null ? Number(fila.stock_maximo) : null,
        stockActual,
        estadoSemaforo: estadoVariante,
      });

      articulo.stockTotal += stockActual;
      if (prioridadEstado[estadoVariante] < prioridadEstado[articulo.estadoAgregado]) {
        articulo.estadoAgregado = estadoVariante;
      }
    }

    return Array.from(articulosMap.values());
  }

  private ocultarCosto(articulo: Articulo, puedeVerCosto: boolean): Articulo {
    if (!articulo || puedeVerCosto) return articulo;
    const result = { ...articulo } as any;
    delete result.costo;
    return result;
  }
}
