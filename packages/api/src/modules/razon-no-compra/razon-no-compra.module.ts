import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazonNoCompraService } from './razon-no-compra.service';
import { RazonNoCompraController } from './razon-no-compra.controller';
import { RazonNoCompra } from './entities/razon-no-compra.entity';
import { SubRazonNoCompra } from './entities/sub-razon-no-compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RazonNoCompra, SubRazonNoCompra])],
  controllers: [RazonNoCompraController],
  providers: [RazonNoCompraService],
  exports: [RazonNoCompraService],
})
export class RazonNoCompraModule {}
