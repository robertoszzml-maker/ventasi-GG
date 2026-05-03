import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubgrupoService } from './subgrupo.service';
import { SubgrupoController } from './subgrupo.controller';
import { Subgrupo } from './entities/subgrupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subgrupo])],
  controllers: [SubgrupoController],
  providers: [SubgrupoService],
  exports: [SubgrupoService],
})
export class SubgrupoModule {}
