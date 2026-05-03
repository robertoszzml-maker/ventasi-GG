import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArqueoCajaService } from './arqueo-caja.service';
import { ArqueoCajaController } from './arqueo-caja.controller';
import { ArqueoCaja, ArqueoCajaDetalle } from './entities/arqueo-caja.entity';
import { SesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArqueoCaja, ArqueoCajaDetalle, SesionCaja])],
  controllers: [ArqueoCajaController],
  providers: [ArqueoCajaService],
  exports: [ArqueoCajaService],
})
export class ArqueoCajaModule {}
