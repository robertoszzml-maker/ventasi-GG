import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaPrecioService } from './lista-precio.service';
import { ListaPrecioController } from './lista-precio.controller';
import { ListaPrecio } from './entities/lista-precio.entity';
import { ArticuloPrecio } from '@/modules/articulo-precio/entities/articulo-precio.entity';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListaPrecio, ArticuloPrecio, Articulo]),
    AuthModule,
  ],
  controllers: [ListaPrecioController],
  providers: [ListaPrecioService],
  exports: [ListaPrecioService],
})
export class ListaPrecioModule {}
