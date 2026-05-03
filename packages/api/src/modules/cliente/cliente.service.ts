import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private repo: Repository<Cliente>,
  ) {}

  async findAll(conditions: FindManyOptions<Cliente>, search?: string) {
    const qb = this.repo.createQueryBuilder('cliente');
    buildWhereAndOrderQuery(qb, conditions, 'cliente');
    if (search) {
      const s = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(cliente.nombre) LIKE :s OR LOWER(cliente.cuit) LIKE :s)',
        { s },
      );
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateClienteDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const tieneDependencias = await this.tieneDependencias(id);
    if (tieneDependencias) {
      throw new BadRequestException('No se puede eliminar el cliente porque tiene movimientos o ventas asociadas.');
    }
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }

  private async tieneDependencias(id: number): Promise<boolean> {
    const count = await this.repo.manager.query(
      `SELECT (
        (SELECT COUNT(*) FROM movimiento_inventario WHERE procedencia_cliente_id = ? AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM movimiento_inventario WHERE destino_cliente_id = ? AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM venta WHERE cliente_id = ? AND deleted_at IS NULL)
      ) AS total`,
      [id, id, id],
    );
    return parseInt(count[0].total) > 0;
  }
}
