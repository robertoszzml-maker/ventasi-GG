import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurvaTalleService } from './curva-talle.service';
import { CurvaTalleController } from './curva-talle.controller';
import { CurvaTalle } from './entities/curva-talle.entity';
import { CurvaTalleDetalle } from './entities/curva-talle-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurvaTalle, CurvaTalleDetalle])],
  controllers: [CurvaTalleController],
  providers: [CurvaTalleService],
  exports: [CurvaTalleService],
})
export class CurvaTalleModule {}
