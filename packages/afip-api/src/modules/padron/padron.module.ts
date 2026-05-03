import { Module } from '@nestjs/common';
import { PadronService } from './padron.service';
import { PadronController } from './padron.controller';
import { LoginService } from 'src/services/login/login.service';

@Module({
  controllers: [PadronController],
  providers: [PadronService, LoginService],
})
export class PadronModule { }
