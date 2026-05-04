import { Module } from '@nestjs/common';
import { PadronService } from './padron.service';
import { PadronController } from './padron.controller';
import { LoginService } from 'src/services/login/login.service';
import { CertificateService } from 'src/services/login/certificate.service';

@Module({
  controllers: [PadronController],
  providers: [PadronService, LoginService, CertificateService],
})
export class PadronModule { }
