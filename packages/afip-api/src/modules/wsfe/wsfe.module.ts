import { Module } from '@nestjs/common';
import { WsfeService } from './wsfe.service';
import { WsfeController } from './wsfe.controller';
import { LoginService } from 'src/services/login/login.service';
import { CertificateService } from 'src/services/login/certificate.service';

@Module({
  controllers: [WsfeController],
  providers: [WsfeService, LoginService, CertificateService],
})
export class WsfeModule { }
