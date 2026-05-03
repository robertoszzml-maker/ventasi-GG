import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Archivo } from '../archivo/entities/archivo.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { Mensaje } from './entities/mensaje.entity';
import { Notificacion } from '../notificacion/entities/notificacion.entity';
import { TIPO_NOTIFICACION } from '@/constants/notificaciones';
import { notaNotificacion } from '@/helpers/string';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayDateTime } from '@/helpers/date';
import { format, toDate } from 'date-fns';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajeRepository: Repository<Mensaje>,
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
  ) { }

  async create(createMensajeDto: CreateMensajeDto) {


    const dateNow = getTodayDateTime()
    createMensajeDto.fecha = dateNow


    const mensaje = await this.mensajeRepository.save(createMensajeDto);
    if (createMensajeDto.usuarioDestino) {
      const notificacion = this.notificacionRepository.create({
        tipoUsuario: 0,
        tipoNotificacion: TIPO_NOTIFICACION.MENSAJE,
        usuarioOrigenId: createMensajeDto.usuarioOrigenId,
        usuarioDestinoId: createMensajeDto.usuarioDestino,
        fecha: dateNow,
        nota: '',
        tipo: createMensajeDto.tipo,
        tipoId: createMensajeDto.tipoId,
      })
      notificacion.nota = notaNotificacion(notificacion)
      await this.notificacionRepository.save(notificacion)
    }
    return mensaje

  }

  async findAll(conditions: FindManyOptions<Mensaje>): Promise<Mensaje[]> {
    const conditionQuery: FindManyOptions<Mensaje> = {
      ...conditions,
    }
    const mensajes = await this.mensajeRepository.find({ ...conditionQuery, where: conditions.where })
    const mensajeLength = mensajes.length
    let result = []
    for (let i = 0; i < mensajeLength; i++) {
      const mensaje = mensajes[i];
      const file = await this.archivoRepository.findOne({
        where: {
          modelo: 'mensaje',
          modeloId: mensaje.id,
          tipo: 'adjunto',
        }
      })
      result.push({
        ...mensaje,
        file
      })
    }
    return result
  }

  async findOne(id: number) {
    return await this.mensajeRepository.findOneBy({ id });
  }

  async update(id: number, updateMensajeDto: UpdateMensajeDto) {
    const dateNow = getTodayDateTime()
    if (updateMensajeDto.fecha_visto) {
      updateMensajeDto.fecha_visto = dateNow
    }
    await this.mensajeRepository.update({ id }, updateMensajeDto);
    return await this.mensajeRepository.findOneBy({ id });
  }

  async remove(id: number) {
    return `This action removes a #${id} mensaje`;
  }
}
