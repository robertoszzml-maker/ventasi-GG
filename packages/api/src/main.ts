import fastifyCsrf from '@fastify/csrf-protection';
import fastyfyMultipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { RequestInterceptor } from './interceptors/request.interceptor'
import { QueryFailedFilter } from './filters/query-failed-error.interceptor'
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 50 * 1024 * 1024, // 50 MB
    }),
  );
  app.setGlobalPrefix('v1');
  // app.setGlobalPrefix('api/v1');
  app.register(fastyfyMultipart);
  await app.register(fastifyCsrf);
  // await app.register(fastifyCookie, {
  //   parseOptions: {
  //     path: '/',
  //     httpOnly: true,
  //     secure: false, // En prod debe ser true
  //   },
  // });
  // await app.register(secureSession, {
  //   secret: 'aSecretWithMinimumLengthOf32Characters',
  //   salt: 'mq9hDxBVDbspDR6n',
  // });
  app.enableCors({
    origin: ['http://localhost:3000', 'http://front:3000', '*'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'app', 'x-api-key'],
    credentials: true,
  });
  app.useGlobalInterceptors(new RequestInterceptor());  // Usamos el interceptor globalmente
  app.useGlobalFilters(new QueryFailedFilter());  // Usamos el interceptor globalmente
  await app.listen(process.env.PORT ?? 3001, "0.0.0.0");
}
bootstrap();


