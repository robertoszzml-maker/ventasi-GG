import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockPorUbicacionService } from './stock-por-ubicacion.service';
import { StockPorUbicacionController } from './stock-por-ubicacion.controller';
import { StockPorUbicacion } from './entities/stock-por-ubicacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockPorUbicacion])],
  controllers: [StockPorUbicacionController],
  providers: [StockPorUbicacionService],
  exports: [StockPorUbicacionService],
})
export class StockPorUbicacionModule {}
