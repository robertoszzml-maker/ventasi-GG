import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedioPago } from './entities/medio-pago.entity';
import { MedioPagoService } from './medio-pago.service';
import { MedioPagoController } from './medio-pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedioPago])],
  controllers: [MedioPagoController],
  providers: [MedioPagoService],
  exports: [MedioPagoService],
})
export class MedioPagoModule {}
