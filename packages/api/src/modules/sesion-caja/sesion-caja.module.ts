import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionCajaService } from './sesion-caja.service';
import { SesionCajaController } from './sesion-caja.controller';
import { SesionCaja } from './entities/sesion-caja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SesionCaja])],
  controllers: [SesionCajaController],
  providers: [SesionCajaService],
  exports: [SesionCajaService],
})
export class SesionCajaModule {}
