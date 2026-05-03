import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { PlantillaNotificacion } from './entities/plantilla-notificacion.entity';
import { CreatePlantillaNotificacionDto } from './dto/create-plantilla-notificacion.dto';
import { UpdatePlantillaNotificacionDto } from './dto/update-plantilla-notificacion.dto';

@Injectable()
export class PlantillaNotificacionService {
    constructor(
        @InjectRepository(PlantillaNotificacion)
        private repo: Repository<PlantillaNotificacion>,
    ) {}

    async findAll(conditions: FindManyOptions<PlantillaNotificacion>) {
        return await this.repo.find({
            ...conditions,
            where: transformToGenericFilters(conditions.where),
        });
    }

    async findOne(id: number) {
        return await this.repo.findOne({ where: { id } });
    }

    async create(dto: CreatePlantillaNotificacionDto) {
        return await this.repo.save(dto);
    }

    async update(id: number, dto: UpdatePlantillaNotificacionDto) {
        await this.repo.update({ id }, dto);
        return await this.findOne(id);
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        await this.repo.delete({ id });
        return entity;
    }
}
