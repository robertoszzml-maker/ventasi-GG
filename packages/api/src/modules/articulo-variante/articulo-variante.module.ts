import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticuloVarianteService } from './articulo-variante.service';
import { ArticuloVarianteController } from './articulo-variante.controller';
import { ArticuloVariante } from './entities/articulo-variante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticuloVariante])],
  controllers: [ArticuloVarianteController],
  providers: [ArticuloVarianteService],
  exports: [ArticuloVarianteService],
})
export class ArticuloVarianteModule {}
