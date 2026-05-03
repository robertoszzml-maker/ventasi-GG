import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoCajaService } from './movimiento-caja.service';
import { MovimientoCajaController } from './movimiento-caja.controller';
import { MovimientoCajaListener } from './movimiento-caja.listener';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { SesionCaja } from '@/modules/sesion-caja/entities/sesion-caja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoCaja, SesionCaja])],
  controllers: [MovimientoCajaController],
  providers: [MovimientoCajaService, MovimientoCajaListener],
  exports: [MovimientoCajaService],
})
export class MovimientoCajaModule {}
