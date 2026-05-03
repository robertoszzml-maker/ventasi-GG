
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Iniciando AFIP Microservice...');

  const port = parseInt(process.env.PORT || '4001', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: port,
        host: "0.0.0.0"
      },
    },
  );

  console.log(`📡 AFIP Microservice configurado en puerto ${port}`);
  await app.listen();
  console.log('✅ AFIP Microservice iniciado correctamente');
}

bootstrap().catch(error => {
  console.error('❌ Error al iniciar AFIP Microservice:', error);
  process.exit(1);
});
