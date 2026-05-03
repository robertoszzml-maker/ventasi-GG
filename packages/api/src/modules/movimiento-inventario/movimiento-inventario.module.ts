import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { MovimientoInventarioController } from './movimiento-inventario.controller';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { MovimientoInventarioDetalle } from './entities/movimiento-inventario-detalle.entity';
import { StockPorUbicacion } from '@/modules/stock-por-ubicacion/entities/stock-por-ubicacion.entity';
import { ArticuloVariante } from '@/modules/articulo-variante/entities/articulo-variante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      MovimientoInventarioDetalle,
      StockPorUbicacion,
      ArticuloVariante,
    ]),
  ],
  controllers: [MovimientoInventarioController],
  providers: [MovimientoInventarioService],
  exports: [MovimientoInventarioService],
})
export class MovimientoInventarioModule {}
