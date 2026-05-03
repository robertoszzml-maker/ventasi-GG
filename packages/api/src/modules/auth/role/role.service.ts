import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolRepository: Repository<Role>,
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    return await this.rolRepository.save(createRoleDto);
  }

  async findAll(conditions: FindManyOptions<Role>): Promise<Role[]> {
    return await this.rolRepository.find({ ...conditions, where: transformToGenericFilters(conditions.where) })
  }

  async findOne(id: number) {
    return await this.rolRepository.findOneBy({ id });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.rolRepository.update({ id }, updateRoleDto);
    return await this.rolRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await this.rolRepository.delete({ id });
    return role;
  }
}