import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Config } from './entities/config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) { }

  async create(createConfigDto: CreateConfigDto): Promise<Config> {
    return await this.configRepository.save(createConfigDto);
  }

  async findAll(conditions: FindManyOptions<Config>): Promise<Config[]> {
    return await this.configRepository.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where),
    });
  }

  async findOne(id: number): Promise<Config> {
    return await this.configRepository.findOneBy({ id });
  }

  async findByKey(clave: string): Promise<Config> {
    return await this.configRepository.findOneBy({ clave });
  }

  async findByModule(modulo: string): Promise<Config[]> {
    return await this.configRepository.find({ where: { modulo } });
  }

  async update(id: number, updateConfigDto: UpdateConfigDto): Promise<Config> {
    await this.configRepository.update({ id }, updateConfigDto);
    return await this.configRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<Config> {
    const config = await this.findOne(id);
    await this.configRepository.delete({ id });
    return config;
  }
  async getValue(clave: string): Promise<string | object> {
    return (await this.configRepository.findOneBy({ clave })).valor
  }

}
