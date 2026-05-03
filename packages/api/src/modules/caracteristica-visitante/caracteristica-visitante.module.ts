import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaracteristicaVisitanteService } from './caracteristica-visitante.service';
import { CaracteristicaVisitanteController } from './caracteristica-visitante.controller';
import { CaracteristicaVisitante } from './entities/caracteristica-visitante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaracteristicaVisitante])],
  controllers: [CaracteristicaVisitanteController],
  providers: [CaracteristicaVisitanteService],
  exports: [CaracteristicaVisitanteService],
})
export class CaracteristicaVisitanteModule {}
