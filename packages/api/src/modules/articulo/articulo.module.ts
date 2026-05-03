import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticuloService } from './articulo.service';
import { ArticuloController } from './articulo.controller';
import { Articulo } from './entities/articulo.entity';
import { ArticuloTalle } from './entities/articulo-talle.entity';
import { ArticuloColor } from './entities/articulo-color.entity';
import { ListaPrecioModule } from '@/modules/lista-precio/lista-precio.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Articulo, ArticuloTalle, ArticuloColor]),
    ListaPrecioModule,
    AuthModule,
  ],
  controllers: [ArticuloController],
  providers: [ArticuloService],
  exports: [ArticuloService],
})
export class ArticuloModule {}
