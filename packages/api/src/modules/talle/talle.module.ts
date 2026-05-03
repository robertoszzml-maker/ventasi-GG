import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TalleService } from './talle.service';
import { TalleController } from './talle.controller';
import { Talle } from './entities/talle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Talle])],
  controllers: [TalleController],
  providers: [TalleService],
  exports: [TalleService],
})
export class TalleModule {}
