import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitaService } from './visita.service';
import { VisitaController } from './visita.controller';
import { Visita } from './entities/visita.entity';
import { CaracteristicaVisitante } from '@/modules/caracteristica-visitante/entities/caracteristica-visitante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visita, CaracteristicaVisitante])],
  controllers: [VisitaController],
  providers: [VisitaService],
  exports: [VisitaService],
})
export class VisitaModule {}
