
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Iniciando AFIP Microservice...');

  // Leer certificados desde variables de entorno (automático)
  const certBase64 = process.env.AFIP_CERTIFICADO_BASE64;
  const keyBase64 = process.env.AFIP_CLAVE_PRIVADA_BASE64;

  if (certBase64 && keyBase64) {
    console.log('✅ Certificados AFIP encontrados en variables de entorno');
    // Convertir de base64 a texto cuando se necesiten
    global.afipCert = Buffer.from(certBase64, 'base64').toString();
    global.afipKey = Buffer.from(keyBase64, 'base64').toString();
  } else {
    console.log('⚠️ Certificados AFIP no configurados en variables de entorno');
  }

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
