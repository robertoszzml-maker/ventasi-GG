import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoVisita, TipoVisitante, Visita } from './entities/visita.entity';
import { CaracteristicaVisitante } from '@/modules/caracteristica-visitante/entities/caracteristica-visitante.entity';
import { CreateVisitaDto, ResolverCompraDto, ResolverNoCompraDto } from './dto/create-visita.dto';

@Injectable()
export class VisitaService {
  constructor(
    @InjectRepository(Visita)
    private repo: Repository<Visita>,
    @InjectRepository(CaracteristicaVisitante)
    private caracteristicaRepo: Repository<CaracteristicaVisitante>,
  ) {}

  private getFechaHora() {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().slice(0, 8);
    return { fecha, hora };
  }

  async crear(dto: CreateVisitaDto, usuarioId: number) {
    const { fecha, hora } = this.getFechaHora();
    const visita = this.repo.create({
      tipoVisitante: dto.tipoVisitante,
      estado: EstadoVisita.PENDIENTE,
      clienteId: dto.clienteId,
      usuarioId,
      fecha,
      hora,
    });

    if (dto.caracteristicaIds?.length) {
      visita.caracteristicas = await this.caracteristicaRepo.findByIds(dto.caracteristicaIds);
    } else {
      visita.caracteristicas = [];
    }

    return await this.repo.save(visita);
  }

  async resolverCompra(id: number, dto: ResolverCompraDto) {
    const visita = await this.repo.findOne({ where: { id } });
    if (!visita) throw new NotFoundException('Visita no encontrada');
    await this.repo.update({ id }, { estado: EstadoVisita.COMPRA, movimientoId: dto.movimientoId });
    return await this.findOne(id);
  }

  async resolverNoCompra(id: number, dto: ResolverNoCompraDto) {
    const visita = await this.repo.findOne({ where: { id } });
    if (!visita) throw new NotFoundException('Visita no encontrada');
    await this.repo.update({ id }, {
      estado: EstadoVisita.NO_COMPRA,
      razonId: dto.razonId,
      subRazonId: dto.subRazonId,
      articuloId: dto.articuloId,
      clienteId: dto.clienteId,
      observaciones: dto.observaciones,
    });
    return await this.findOne(id);
  }

  async findPendientesDelDia() {
    const { fecha } = this.getFechaHora();
    return await this.repo.find({
      where: { fecha, estado: EstadoVisita.PENDIENTE },
      relations: ['caracteristicas'],
      order: { hora: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ['caracteristicas', 'razon', 'subRazon', 'articulo', 'cliente'],
    });
  }

  async metricasDelDia() {
    const { fecha } = this.getFechaHora();
    const [entradas, compras, noCompras, pendientes] = await Promise.all([
      this.repo.count({ where: { fecha } }),
      this.repo.count({ where: { fecha, estado: EstadoVisita.COMPRA } }),
      this.repo.count({ where: { fecha, estado: EstadoVisita.NO_COMPRA } }),
      this.repo.count({ where: { fecha, estado: EstadoVisita.PENDIENTE } }),
    ]);
    const conversion = entradas > 0 ? Math.round((compras / entradas) * 100) : 0;
    return { entradas, compras, noCompras, pendientes, conversion };
  }

  async dashboard(periodo: 'hoy' | 'semana' | 'mes') {
    const now = new Date();
    let fechaDesde: string;
    let fechaHasta: string;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatFecha = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (periodo === 'hoy') {
      fechaDesde = formatFecha(now);
      fechaHasta = fechaDesde;
    } else if (periodo === 'semana') {
      const inicio = new Date(now);
      inicio.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      fechaDesde = formatFecha(inicio);
      fechaHasta = formatFecha(now);
    } else {
      fechaDesde = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      fechaHasta = formatFecha(now);
    }

    const visitas = await this.repo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.razon', 'razon')
      .leftJoinAndSelect('v.subRazon', 'subRazon')
      .where('v.fecha >= :fechaDesde AND v.fecha <= :fechaHasta', { fechaDesde, fechaHasta })
      .andWhere('v.deleted_at IS NULL')
      .getMany();

    const entradas = visitas.length;
    const compras = visitas.filter((v) => v.estado === EstadoVisita.COMPRA).length;
    const noCompras = visitas.filter((v) => v.estado === EstadoVisita.NO_COMPRA).length;
    const pendientes = visitas.filter((v) => v.estado === EstadoVisita.PENDIENTE).length;
    const conversion = entradas > 0 ? Math.round((compras / entradas) * 100) : 0;

    // Razones de no compra
    const visitasNoCompra = visitas.filter((v) => v.estado === EstadoVisita.NO_COMPRA);
    const razonesMap = new Map<number, { razon: any; total: number; subRazones: Map<number, { subRazon: any; total: number }> }>();
    for (const v of visitasNoCompra) {
      if (!v.razonId) continue;
      if (!razonesMap.has(v.razonId)) {
        razonesMap.set(v.razonId, { razon: v.razon, total: 0, subRazones: new Map() });
      }
      const entry = razonesMap.get(v.razonId)!;
      entry.total++;
      if (v.subRazonId) {
        if (!entry.subRazones.has(v.subRazonId)) {
          entry.subRazones.set(v.subRazonId, { subRazon: v.subRazon, total: 0 });
        }
        entry.subRazones.get(v.subRazonId)!.total++;
      }
    }

    const razones = Array.from(razonesMap.values())
      .sort((a, b) => b.total - a.total)
      .map(({ razon, total, subRazones }) => ({
        razon,
        total,
        porcentaje: noCompras > 0 ? Math.round((total / noCompras) * 100) : 0,
        subRazones: Array.from(subRazones.values())
          .sort((a, b) => b.total - a.total)
          .map(({ subRazon, total: subTotal }) => ({
            subRazon,
            total: subTotal,
            porcentaje: total > 0 ? Math.round((subTotal / total) * 100) : 0,
          })),
      }));

    // Tabla cruzada por tipo de visitante
    const tiposMap = new Map<TipoVisitante, { entradas: number; compras: number; noCompras: number; razonesCount: Map<number, number> }>();
    for (const v of visitas) {
      if (!tiposMap.has(v.tipoVisitante)) {
        tiposMap.set(v.tipoVisitante, { entradas: 0, compras: 0, noCompras: 0, razonesCount: new Map() });
      }
      const t = tiposMap.get(v.tipoVisitante)!;
      t.entradas++;
      if (v.estado === EstadoVisita.COMPRA) t.compras++;
      if (v.estado === EstadoVisita.NO_COMPRA) {
        t.noCompras++;
        if (v.razonId) t.razonesCount.set(v.razonId, (t.razonesCount.get(v.razonId) ?? 0) + 1);
      }
    }

    const tablaTipos = Array.from(tiposMap.entries()).map(([tipo, data]) => {
      const razonPrincipalId = [...data.razonesCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const razonPrincipal = razonPrincipalId ? razonesMap.get(razonPrincipalId)?.razon : null;
      return {
        tipo,
        entradas: data.entradas,
        compras: data.compras,
        noCompras: data.noCompras,
        conversion: data.entradas > 0 ? Math.round((data.compras / data.entradas) * 100) : 0,
        razonPrincipal,
      };
    });

    return { periodo, fechaDesde, fechaHasta, entradas, compras, noCompras, pendientes, conversion, razones, tablaTipos };
  }
}
