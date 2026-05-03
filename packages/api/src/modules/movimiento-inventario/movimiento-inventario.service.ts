import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MovimientoInventario, TipoMovimiento } from './entities/movimiento-inventario.entity';
import { MovimientoInventarioDetalle } from './entities/movimiento-inventario-detalle.entity';
import { StockPorUbicacion } from '@/modules/stock-por-ubicacion/entities/stock-por-ubicacion.entity';
import { ArticuloVariante } from '@/modules/articulo-variante/entities/articulo-variante.entity';
import { ArticuloTalle } from '@/modules/articulo/entities/articulo-talle.entity';
import { ArticuloColor } from '@/modules/articulo/entities/articulo-color.entity';
import { CreateMovimientoInventarioDto, DetalleMovimientoDto } from './dto/create-movimiento-inventario.dto';
import { QueryMovimientoInventarioDto } from './dto/query-movimiento-inventario.dto';

@Injectable()
export class MovimientoInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private movimientoRepo: Repository<MovimientoInventario>,
    @InjectRepository(MovimientoInventarioDetalle)
    private detalleRepo: Repository<MovimientoInventarioDetalle>,
    @InjectRepository(StockPorUbicacion)
    private stockRepo: Repository<StockPorUbicacion>,
    @InjectRepository(ArticuloVariante)
    private varianteRepo: Repository<ArticuloVariante>,
    private dataSource: DataSource,
  ) {}

  async findAll(query: QueryMovimientoInventarioDto, take: number, skip: number) {
    const qb = this.movimientoRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.responsable', 'responsable')
      .leftJoinAndSelect('m.procedenciaUbicacion', 'procUbicacion')
      .leftJoinAndSelect('m.procedenciaProveedor', 'procProveedor')
      .leftJoinAndSelect('m.procedenciaCliente', 'procCliente')
      .leftJoinAndSelect('m.destinoUbicacion', 'destUbicacion')
      .leftJoinAndSelect('m.destinoProveedor', 'destProveedor')
      .leftJoinAndSelect('m.destinoCliente', 'destCliente')
      .where('m.deletedAt IS NULL')
      .orderBy('m.fecha', 'DESC')
      .addOrderBy('m.id', 'DESC');

    if (query.tipo) {
      qb.andWhere('m.tipo = :tipo', { tipo: query.tipo });
    }
    if (query.fechaDesde) {
      qb.andWhere('m.fecha >= :fechaDesde', { fechaDesde: query.fechaDesde });
    }
    if (query.fechaHasta) {
      qb.andWhere('m.fecha <= :fechaHasta', { fechaHasta: query.fechaHasta });
    }
    if (query.ubicacionId) {
      qb.andWhere(
        '(m.procedenciaUbicacionId = :ubId OR m.destinoUbicacionId = :ubId)',
        { ubId: parseInt(query.ubicacionId) },
      );
    }

    if (take) qb.take(take);
    if (skip) qb.skip(skip);

    return qb.getMany();
  }

  async findOne(id: number) {
    return await this.movimientoRepo.findOne({
      where: { id },
      relations: [
        'responsable',
        'procedenciaUbicacion',
        'procedenciaProveedor',
        'procedenciaCliente',
        'destinoUbicacion',
        'destinoProveedor',
        'destinoCliente',
        'detalles',
        'detalles.articuloVariante',
        'detalles.articuloVariante.talle',
        'detalles.articuloVariante.color',
        'detalles.articuloVariante.articulo',
      ],
    });
  }

  async create(dto: CreateMovimientoInventarioDto) {
    this.validarProcedenciaDestino(dto);

    return await this.dataSource.transaction(async (manager) => {
      // 1. Resolver/crear variantes
      const detallesResueltos = await this.resolverVariantes(dto.detalles, manager);

      // 2. Calcular cantidad total
      const cantidadTotal = detallesResueltos.reduce(
        (sum, d) => sum + parseInt(d.cantidad || '0'),
        0,
      ).toString();

      // 3. Crear cabecera
      const movimiento = manager.create(MovimientoInventario, {
        tipo: dto.tipo,
        fecha: dto.fecha,
        descripcion: dto.descripcion,
        cantidadTotal,
        responsableId: dto.responsableId,
        procedenciaUbicacionId: dto.procedenciaUbicacionId,
        procedenciaProveedorId: dto.procedenciaProveedorId,
        procedenciaClienteId: dto.procedenciaClienteId,
        destinoUbicacionId: dto.destinoUbicacionId,
        destinoProveedorId: dto.destinoProveedorId,
        destinoClienteId: dto.destinoClienteId,
      });
      const movimientoGuardado = await manager.save(MovimientoInventario, movimiento);

      // 4. Procesar detalles y actualizar stock según tipo
      for (const detalle of detallesResueltos) {
        const varianteId = detalle.articuloVarianteId;

        if (dto.tipo === TipoMovimiento.ARREGLO) {
          await this.procesarArreglo(manager, movimientoGuardado.id, detalle, dto.procedenciaUbicacionId!);
        } else {
          await manager.save(MovimientoInventarioDetalle, {
            movimientoId: movimientoGuardado.id,
            articuloVarianteId: varianteId,
            cantidad: detalle.cantidad,
          });

          await this.actualizarStock(manager, dto, varianteId, parseInt(detalle.cantidad));
        }
      }

      return this.findOne(movimientoGuardado.id);
    });
  }

  private async resolverVariantes(
    detalles: DetalleMovimientoDto[],
    manager: any,
  ): Promise<DetalleMovimientoDto[]> {
    const resultado: DetalleMovimientoDto[] = [];

    for (const detalle of detalles) {
      // Si ya tiene articuloVarianteId real (>0), usar directo
      if (detalle.articuloVarianteId && detalle.articuloVarianteId > 0) {
        resultado.push(detalle);
        continue;
      }

      // Es nueva combinación: buscar o crear variante
      if (!detalle.articuloId || !detalle.talleId || !detalle.colorId) {
        throw new BadRequestException('Para nueva combinación se requiere articuloId, talleId y colorId.');
      }

      let variante = await manager.findOne(ArticuloVariante, {
        where: {
          articuloId: detalle.articuloId,
          talleId: detalle.talleId,
          colorId: detalle.colorId,
        },
      });

      if (!variante) {
        variante = await manager.save(ArticuloVariante, {
          articuloId: detalle.articuloId,
          talleId: detalle.talleId,
          colorId: detalle.colorId,
          cantidad: '0',
        });

        // Agregar talle a la curva del artículo si no está
        const talleEnCurva = await manager.findOne(ArticuloTalle, {
          where: { articuloId: detalle.articuloId, talleId: detalle.talleId },
        });
        if (!talleEnCurva) {
          await manager.save(ArticuloTalle, {
            articuloId: detalle.articuloId,
            talleId: detalle.talleId,
            orden: 0,
          });
        }

        // Agregar color a la curva del artículo si no está
        const colorEnCurva = await manager.findOne(ArticuloColor, {
          where: { articuloId: detalle.articuloId, colorId: detalle.colorId },
        });
        if (!colorEnCurva) {
          await manager.save(ArticuloColor, {
            articuloId: detalle.articuloId,
            colorId: detalle.colorId,
            orden: 0,
          });
        }
      }

      resultado.push({ ...detalle, articuloVarianteId: variante.id });
    }

    return resultado;
  }

  private async actualizarStock(
    manager: any,
    dto: CreateMovimientoInventarioDto,
    articuloVarianteId: number,
    cantidad: number,
  ) {
    if (dto.procedenciaUbicacionId) {
      await this.restarStock(manager, articuloVarianteId, dto.procedenciaUbicacionId, cantidad);
    }
    if (dto.destinoUbicacionId) {
      await this.sumarStock(manager, articuloVarianteId, dto.destinoUbicacionId, cantidad);
    }
  }

  private async procesarArreglo(
    manager: any,
    movimientoId: number,
    detalle: DetalleMovimientoDto,
    ubicacionId: number,
  ) {
    const stockActual = await manager.findOne(StockPorUbicacion, {
      where: { articuloVarianteId: detalle.articuloVarianteId, ubicacionId },
    });

    const cantidadAnterior = stockActual?.cantidad ?? '0';
    const cantidadNueva = detalle.cantidadNueva ?? detalle.cantidad;

    // Actualizar stock en la ubicación
    if (stockActual) {
      await manager.update(StockPorUbicacion, stockActual.id, {
        cantidad: cantidadNueva,
      });
    } else {
      await manager.save(StockPorUbicacion, {
        articuloVarianteId: detalle.articuloVarianteId,
        ubicacionId,
        cantidad: cantidadNueva,
      });
    }

    await manager.save(MovimientoInventarioDetalle, {
      movimientoId,
      articuloVarianteId: detalle.articuloVarianteId,
      cantidad: (parseInt(cantidadNueva) - parseInt(cantidadAnterior)).toString(),
      cantidadAnterior,
      cantidadNueva,
    });
  }

  private async sumarStock(
    manager: any,
    articuloVarianteId: number,
    ubicacionId: number,
    cantidad: number,
  ) {
    const stock = await manager.findOne(StockPorUbicacion, {
      where: { articuloVarianteId, ubicacionId },
    });

    if (stock) {
      await manager.update(StockPorUbicacion, stock.id, {
        cantidad: (parseInt(stock.cantidad) + cantidad).toString(),
      });
    } else {
      await manager.save(StockPorUbicacion, {
        articuloVarianteId,
        ubicacionId,
        cantidad: cantidad.toString(),
      });
    }
  }

  private async restarStock(
    manager: any,
    articuloVarianteId: number,
    ubicacionId: number,
    cantidad: number,
  ) {
    const stock = await manager.findOne(StockPorUbicacion, {
      where: { articuloVarianteId, ubicacionId },
    });

    const stockActual = parseInt(stock?.cantidad ?? '0');
    if (stockActual < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para la variante ${articuloVarianteId} en la ubicación ${ubicacionId}. Stock actual: ${stockActual}, solicitado: ${cantidad}.`,
      );
    }

    await manager.update(StockPorUbicacion, stock.id, {
      cantidad: (stockActual - cantidad).toString(),
    });
  }

  private validarProcedenciaDestino(dto: CreateMovimientoInventarioDto) {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('El movimiento debe tener al menos un detalle.');
    }

    if (dto.tipo === TipoMovimiento.ARREGLO) {
      if (!dto.procedenciaUbicacionId) {
        throw new BadRequestException('El arreglo requiere una ubicación.');
      }
      return;
    }

    const procedencias = [
      dto.procedenciaUbicacionId,
      dto.procedenciaProveedorId,
      dto.procedenciaClienteId,
    ].filter(Boolean);

    const destinos = [
      dto.destinoUbicacionId,
      dto.destinoProveedorId,
      dto.destinoClienteId,
    ].filter(Boolean);

    if (procedencias.length === 0) {
      throw new BadRequestException('Debe especificar exactamente una procedencia.');
    }
    if (procedencias.length > 1) {
      throw new BadRequestException('Solo puede especificar una procedencia.');
    }
    if (destinos.length === 0) {
      throw new BadRequestException('Debe especificar exactamente un destino.');
    }
    if (destinos.length > 1) {
      throw new BadRequestException('Solo puede especificar un destino.');
    }

    // Al menos uno de los dos extremos debe ser una ubicación para afectar el stock
    if (!dto.procedenciaUbicacionId && !dto.destinoUbicacionId) {
      throw new BadRequestException('Al menos la procedencia o el destino debe ser una ubicación.');
    }
  }
}
