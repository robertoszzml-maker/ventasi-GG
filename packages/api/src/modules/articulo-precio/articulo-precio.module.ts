import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticuloPrecioService } from './articulo-precio.service';
import { ArticuloPrecioController } from './articulo-precio.controller';
import { ArticuloPrecio } from './entities/articulo-precio.entity';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { ListaPrecio } from '@/modules/lista-precio/entities/lista-precio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticuloPrecio, Articulo, ListaPrecio])],
  controllers: [ArticuloPrecioController],
  providers: [ArticuloPrecioService],
  exports: [ArticuloPrecioService],
})
export class ArticuloPrecioModule {}
