import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptoMovimientoService } from './concepto-movimiento.service';
import { ConceptoMovimientoController } from './concepto-movimiento.controller';
import { ConceptoMovimiento } from './entities/concepto-movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConceptoMovimiento])],
  controllers: [ConceptoMovimientoController],
  providers: [ConceptoMovimientoService],
  exports: [ConceptoMovimientoService],
})
export class ConceptoMovimientoModule {}
