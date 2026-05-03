import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cobro } from './entities/cobro.entity';
import { MedioPago } from '@/modules/medio-pago/entities/medio-pago.entity';
import { Venta } from '@/modules/venta/entities/venta.entity';
import { CobroService } from './cobro.service';
import { CobroController } from './cobro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cobro, MedioPago, Venta])],
  controllers: [CobroController],
  providers: [CobroService],
  exports: [CobroService],
})
export class CobroModule {}
