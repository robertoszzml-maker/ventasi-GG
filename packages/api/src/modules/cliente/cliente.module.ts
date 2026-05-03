import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente } from './entities/cliente.entity';
import { AFIP_SERVICE } from '@/constants/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    ClientsModule.register([
      {
        name: 'AFIP_SERVICE',
        transport: Transport.TCP,
        options: {
          host: AFIP_SERVICE.host || 'localhost',
          port: AFIP_SERVICE.port,
        },
      },
    ]),
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService],
})
export class ClienteModule {}
