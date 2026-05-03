import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurvaColorService } from './curva-color.service';
import { CurvaColorController } from './curva-color.controller';
import { CurvaColor } from './entities/curva-color.entity';
import { CurvaColorDetalle } from './entities/curva-color-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurvaColor, CurvaColorDetalle])],
  controllers: [CurvaColorController],
  providers: [CurvaColorService],
  exports: [CurvaColorService],
})
export class CurvaColorModule {}
