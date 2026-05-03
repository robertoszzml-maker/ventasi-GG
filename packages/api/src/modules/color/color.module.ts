import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColorService } from './color.service';
import { ColorController } from './color.controller';
import { Color } from './entities/color.entity';
import { ColorCodigo } from './entities/color-codigo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Color, ColorCodigo])],
  controllers: [ColorController],
  providers: [ColorService],
  exports: [ColorService],
})
export class ColorModule {}
