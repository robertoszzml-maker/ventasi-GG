import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjemploController } from './ejemplo.controller';
import { EjemploService } from './ejemplo.service';
import { Ejemplo } from './entities/ejemplo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ejemplo])],
  controllers: [EjemploController],
  providers: [EjemploService],
  exports: [EjemploService],
})
export class EjemploModule {}
