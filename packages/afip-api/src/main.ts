
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Iniciando AFIP Microservice v2.0...');

  // Leer certificados desde variables de entorno (divididas o únicas)
  const certParts = [
    process.env.AFIP_CERT_BASE64_1,
    process.env.AFIP_CERT_BASE64_2,
    process.env.AFIP_CERT_BASE64_3
  ].filter(Boolean);

  const keyParts = [
    process.env.AFIP_KEY_BASE64_1,
    process.env.AFIP_KEY_BASE64_2,
    process.env.AFIP_KEY_BASE64_3
  ].filter(Boolean);

  // Si no hay variables divididas, intentar con variables únicas
  const certBase64 = certParts.length > 0 ? certParts.join('') : process.env.AFIP_CERT_BASE64;
  const keyBase64 = keyParts.length > 0 ? keyParts.join('') : process.env.AFIP_KEY_BASE64;

  if (certBase64 && keyBase64) {
    console.log('✅ Certificados AFIP encontrados en variables de entorno');
    // Convertir de base64 a texto cuando se necesiten
    global.afipCert = Buffer.from(certBase64, 'base64').toString();
    global.afipKey = Buffer.from(keyBase64, 'base64').toString();
  } else {
    console.log('⚠️ Certificados AFIP no configurados en variables de entorno');
  }

  const port = parseInt(process.env.PORT || '4001', 10);

  const app = await NestFactory.create(AppModule);

  await app.listen(port, '0.0.0.0');
  console.log(`🌐 AFIP API HTTP configurada en puerto ${port}`);
  console.log('✅ AFIP API HTTP iniciada correctamente');
}

bootstrap().catch(error => {
  console.error('❌ Error al iniciar AFIP Microservice:', error);
  process.exit(1);
});
