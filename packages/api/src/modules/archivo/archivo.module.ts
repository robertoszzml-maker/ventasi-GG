import { Module } from '@nestjs/common';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Archivo } from './entities/archivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Archivo])],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [ArchivoService, TypeOrmModule]
})
export class ArchivoModule { }
