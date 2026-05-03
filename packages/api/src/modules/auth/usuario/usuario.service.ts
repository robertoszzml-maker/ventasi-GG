import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { OrderValues } from '@/types';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto) {
    createUsuarioDto.password = await bcrypt.hash(createUsuarioDto.password, 10);
    const usuario = await this.usuarioRepository.save(createUsuarioDto);
    return usuario;
  }


  async findAll(conditions: FindManyOptions<Usuario>): Promise<Usuario[]> {

    const order = conditions.order || {};
    const roleIdWhere =
      'roleId' in conditions.where && conditions.where.roleId
        ? conditions.where.roleId
        : null;

    if (order['role']) {
      order.role = {
        nombre: order.role as OrderValues
      }
    }
    return await this.usuarioRepository.find({
      ...conditions,
      where: {
        ...transformToGenericFilters(conditions.where),
        roleId: roleIdWhere
      },
      relations: {
        role: true,
      },
      order
    })
  }

  async findOne(id: number) {
    return await this.usuarioRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        active: true,
        telefono: true,
        telefonoOtro: true,
        attemps: true,
        roleId: true,
      },
      relations: {
        role: true
      },

    });
  }

  async findRolesByUser(id: number) {
    const user = await this.usuarioRepository.findOne({
      where: { id },
      relations: { role: true },
    });

    return user?.role ? [user.role] : [];
  }


  async findOneByAuth(id: number) {
    let usuario;
    if (id) {
      usuario = await this.usuarioRepository.findOne({
        where: { id },
        relations: {
          role: true,
          avatar: {
            archivo: true
          }
        }
      });
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { password, ...rest } = updateUsuarioDto;
    const updateData: Partial<UpdateUsuarioDto> = { ...rest };

    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
      updateData.attemps = 0;
    }

    await this.usuarioRepository.update({ id }, updateData);
    return this.findOne(id);
  }


  findOneByEmail(usernameInput: string): Promise<Usuario> {
    const email = usernameInput.replace(/\s/g, '').toLowerCase();

    return this.usuarioRepository.findOne({
      where: { email },
      relations: {
        role: true
      }
    });
  }

  async updateRole(id: number, roleId: number) {
    await this.usuarioRepository.update(id, { roleId });
    return this.findOne(id); // Para devolver el usuario actualizado
  }

  async updateAttemps(id: number, attemps: number) {
    return await this.update(id, { attemps });
  }

  async remove(id: number) {
    await this.usuarioRepository.delete(id);
  }

}
