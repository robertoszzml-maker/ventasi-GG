import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PadronModule } from './modules/padron/padron.module';
import { WsfeModule } from './modules/wsfe/wsfe.module';
import { LoginService } from './services/login/login.service';
import { CertificateService } from './services/login/certificate.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env'
      ],
    }),
    PadronModule,
    WsfeModule,
  ],
  controllers: [AppController],
  providers: [AppService, CertificateService, LoginService],
  exports: [],
})
export class AppModule { }
