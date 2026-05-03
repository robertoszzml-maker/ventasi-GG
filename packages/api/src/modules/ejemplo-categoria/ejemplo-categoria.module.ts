import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjemploCategoriaController } from './ejemplo-categoria.controller';
import { EjemploCategoriaService } from './ejemplo-categoria.service';
import { EjemploCategoria } from './entities/ejemplo-categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EjemploCategoria])],
  controllers: [EjemploCategoriaController],
  providers: [EjemploCategoriaService],
  exports: [EjemploCategoriaService],
})
export class EjemploCategoriaModule {}
