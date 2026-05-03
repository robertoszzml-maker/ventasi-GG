import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository, In } from 'typeorm';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { Notificacion } from './entities/notificacion.entity';
import { notaNotificacion } from '@/helpers/string';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../auth/usuario/entities/usuario.entity';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

  ) { }

  async create(createNotificacionDto: CreateNotificacionDto) {
    return await this.notificacionRepository.save(createNotificacionDto);
  }

  async findAll(conditions: FindManyOptions<Notificacion>): Promise<Notificacion[]> {
    const conditionQuery: FindManyOptions<Notificacion> = {
      ...conditions,
      order: {
        fecha: 'DESC'
      }
    }
    const notificaciones = await this.notificacionRepository.find({ ...conditionQuery, where: conditions.where })

    notificaciones.forEach((notificacion) => {
      if (!Boolean(notificacion.nota?.trim())) {
        notificacion.nota = notaNotificacion(notificacion)
      }
    })
    return notificaciones
  }

  async findOne(id: number) {
    return await this.notificacionRepository.findOneBy({ id });
  }

  async update(id: number, updateNotificacionDto: UpdateNotificacionDto) {
    await this.notificacionRepository.update({ id }, updateNotificacionDto);
    return await this.notificacionRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const element = await this.findOne(id);
    await this.notificacionRepository.delete({ id });
    return element

  }
  async notificarPorRoles(roles: number[], dto: CreateNotificacionDto) {
    const usuarios = await this.usuarioRepository.find({
      where: { roleId: In(roles) }
    });

    const notificaciones = usuarios.map((usuario) => ({
      ...dto,
      usuarioDestinoId: usuario.id
    }));

    return await this.notificacionRepository.save(notificaciones);
  }
  async notificarAUsuario(usuarioId: number, dto: CreateNotificacionDto) {
    const notificacion = {
      ...dto,
      usuarioDestinoId: usuarioId
    };

    return await this.notificacionRepository.save(notificacion);
  }



}
