import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { Venta } from './entities/venta.entity';
import { VentaDetalle } from './entities/venta-detalle.entity';
import { Comprobante } from './entities/comprobante.entity';
import { AFIP_SERVICE } from '@/constants/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, VentaDetalle, Comprobante]),
    ClientsModule.register([
      {
        name: 'AFIP_SERVICE',
        transport: Transport.TCP,
        options: {
          host: AFIP_SERVICE.host || 'localhost',
          port: AFIP_SERVICE.port,
        },
      },
    ]),
  ],
  controllers: [VentaController],
  providers: [VentaService],
  exports: [VentaService],
})
export class VentaModule {}
