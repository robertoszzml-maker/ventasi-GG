# Implementación de Notificaciones Push con Microservicio

Este documento detalla la implementación de notificaciones push usando **Web Push API nativa** con arquitectura de **microservicio independiente y stateless**, similar al microservicio de AFIP.

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [API Principal - Gestión de Suscripciones](#api-principal---gestión-de-suscripciones)
3. [Microservicio Push (push-api)](#microservicio-push-push-api)
4. [Frontend - PWA con Next.js 15](#frontend---pwa-con-nextjs-15)
5. [Service Worker](#service-worker)
6. [Testing y Debugging](#testing-y-debugging)
7. [Deployment](#deployment)

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         Monorepo                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  packages/api (Puerto 3001)                                     │
│  ├── Base de datos (tabla push_subscription)                    │
│  ├── PushSubscriptionService (CRUD suscripciones)               │
│  ├── PushService (cliente TCP, patrón AFIP)                     │
│  ├── NotificacionService.create()                               │
│  └── Envía mensaje TCP → push-api con suscripciones             │
│                                                                  │
│  packages/push-api (Puerto 5001) - MICROSERVICIO STATELESS     │
│  ├── Sin base de datos (stateless)                              │
│  ├── Configuración VAPID                                        │
│  ├── Recibe eventos vía TCP con suscripciones                   │
│  └── Envía notificaciones con Web Push                          │
│                                                                  │
│  packages/afip-api (Puerto 4001)                                │
│  └── Microservicio AFIP (referencia del patrón)                 │
│                                                                  │
│  packages/front (Puerto 3000)                                   │
│  ├── PWA con Service Worker                                     │
│  ├── Se comunica con API para CRUD suscripciones                │
│  └── Recibe notificaciones del navegador                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Flujo de notificación:
1. NotificacionService → Busca suscripciones en DB (API)
2. API → pushService.send(suscripciones, notificacion) → TCP
3. push-api → Recibe suscripciones + notificación → Envía Web Push
4. Push Service (Chrome/Firefox) → Service Worker → Usuario
```

**Ventajas de esta arquitectura:**
- ✅ **Separación clara**: API maneja datos, push-api solo envía
- ✅ **Patrón AFIP**: Simple, consistente con el resto del proyecto
- ✅ **push-api stateless**: Sin DB, solo lógica de envío (escalable)
- ✅ **Escalabilidad**: push-api puede tener múltiples instancias sin conflictos
- ✅ **Mantenibilidad**: Cambios en push no afectan API principal
- ✅ **Tecnología agnóstica**: Usa estándares web sin Firebase

## API Principal - Configuración Simple

### 1. Agregar Constante del Microservicio

Agregar a `packages/api/src/constants/microservices.ts`:

```typescript
const PUSH_SERVICE = {
  name: 'PUSH_SERVICE',
  port: 5001,
  host: process.env.PUSH_HOST || 'localhost'
}

export { AFIP_SERVICE, PUSH_SERVICE };
```

### 2. Crear Migración SQL

Crear `packages/api/sql/64.sql`:

```sql
-- Tabla para almacenar suscripciones push
CREATE TABLE push_subscription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_usuario (usuario_id),

  CONSTRAINT fk_push_subscription_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuario(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Generar Módulo en API

```bash
cd packages/api
nest g module modules/push
nest g service modules/push
```

### 4. Entidad PushSubscription

Crear `packages/api/src/modules/push/entities/push-subscription.entity.ts`:

```typescript
import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'push_subscription' })
export class PushSubscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', type: 'int' })
  @Index()
  usuarioId: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 255 })
  p256dh: string;

  @Column({ type: 'varchar', length: 255 })
  auth: string;
}
```

### 5. Servicio de Suscripciones (CRUD)

Crear `packages/api/src/modules/push/push-subscription.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PushSubscription } from './entities/push-subscription.entity';
import { getUser } from '@/helpers/get-user';

@Injectable()
export class PushSubscriptionService {
  constructor(
    @InjectRepository(PushSubscription)
    private repo: Repository<PushSubscription>,
  ) {}

  async subscribe(endpoint: string, p256dh: string, auth: string) {
    const user = getUser();
    const existing = await this.repo.findOne({ where: { endpoint } });

    if (existing) {
      return await this.repo.save({ ...existing, usuarioId: user.id, p256dh, auth });
    }

    return await this.repo.save({ usuarioId: user.id, endpoint, p256dh, auth });
  }

  async unsubscribe(endpoint: string) {
    await this.repo.delete({ endpoint });
  }

  async getByUser(usuarioId: number) {
    return await this.repo.find({ where: { usuarioId } });
  }

  async getByUsers(usuarioIds: number[]) {
    return await this.repo.find({ where: { usuarioId: In(usuarioIds) } });
  }

  async deleteByIds(ids: number[]) {
    if (ids.length > 0) await this.repo.delete({ id: In(ids) });
  }
}
```

### 6. Servicio Push (Cliente TCP - Patrón AFIP)

Crear `packages/api/src/modules/push/push.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PUSH_SERVICE } from '@/constants/microservices';
import { PushSubscriptionService } from './push-subscription.service';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @Inject(PUSH_SERVICE.name) private client: ClientProxy,
    private pushSubscriptionService: PushSubscriptionService,
  ) {}

  /**
   * Obtener clave pública VAPID
   */
  async getPublicKey(): Promise<string> {
    const response = await firstValueFrom(
      this.client.send('push.getPublicKey', {}),
    );
    return response.publicKey;
  }

  /**
   * Enviar notificación push a un usuario
   */
  async sendToUser(data: {
    usuarioId: number;
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  }): Promise<void> {
    // Buscar suscripciones del usuario en DB
    const subscriptions = await this.pushSubscriptionService.getUserSubscriptions(data.usuarioId);

    if (subscriptions.length === 0) {
      this.logger.log(`Usuario ${data.usuarioId} no tiene suscripciones activas`);
      return;
    }

    // Enviar al microservicio con las suscripciones
    const result = await firstValueFrom(
      this.client.send('push.send', {
        subscriptions: subscriptions.map(s => ({
          id: s.id,
          endpoint: s.endpoint,
          keys: {
            p256dh: s.p256dh,
            auth: s.auth,
          },
        })),
        notification: {
          title: data.title,
          body: data.body,
          icon: data.icon || '/icons/icon-192x192.png',
          badge: data.badge || '/icons/badge-72x72.png',
          image: data.image,
          tag: data.tag,
          data: data.data,
          requireInteraction: data.requireInteraction,
        },
      }),
    );

    // Eliminar suscripciones inválidas
    if (result?.invalidSubscriptionIds?.length > 0) {
      await this.pushSubscriptionService.deleteInvalid(result.invalidSubscriptionIds);
    }
  }

  /**
   * Enviar notificación push a múltiples usuarios
   */
  async sendToUsers(data: {
    usuarioIds: number[];
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  }): Promise<void> {
    // Buscar suscripciones de múltiples usuarios en DB
    const subscriptions = await this.pushSubscriptionService.getUsersSubscriptions(data.usuarioIds);

    if (subscriptions.length === 0) {
      this.logger.log('Ningún usuario tiene suscripciones activas');
      return;
    }

    // Enviar al microservicio con las suscripciones
    const result = await firstValueFrom(
      this.client.send('push.send', {
        subscriptions: subscriptions.map(s => ({
          id: s.id,
          endpoint: s.endpoint,
          keys: {
            p256dh: s.p256dh,
            auth: s.auth,
          },
        })),
        notification: {
          title: data.title,
          body: data.body,
          icon: data.icon || '/icons/icon-192x192.png',
          badge: data.badge || '/icons/badge-72x72.png',
          image: data.image,
          tag: data.tag,
          data: data.data,
          requireInteraction: data.requireInteraction,
        },
      }),
    );

    // Eliminar suscripciones inválidas
    if (result?.invalidSubscriptionIds?.length > 0) {
      await this.pushSubscriptionService.deleteInvalid(result.invalidSubscriptionIds);
    }
  }
}
```

### 7. Módulo

Crear `packages/api/src/modules/push/push.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PushService } from './push.service';
import { PushSubscriptionService } from './push-subscription.service';
import { PushController } from './push.controller';
import { PushSubscription } from './entities/push-subscription.entity';
import { PUSH_SERVICE } from '@/constants/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscription]),
    ClientsModule.register([
      {
        name: PUSH_SERVICE.name,
        transport: Transport.TCP,
        options: {
          port: PUSH_SERVICE.port,
          host: PUSH_SERVICE.host,
        },
      },
    ]),
  ],
  controllers: [PushController],
  providers: [PushService, PushSubscriptionService],
  exports: [PushService],
})
export class PushModule {}
```

### 8. Controlador

Crear `packages/api/src/modules/push/push.controller.ts`:

```typescript
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PushService } from './push.service';
import { PushSubscriptionService } from './push-subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';

@Controller('push')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  @Get('vapid-public-key')
  async getPublicKey() {
    const publicKey = await this.pushService.getPublicKey();
    return { publicKey };
  }

  @Post('subscribe')
  async subscribe(@Body() dto: any) {
    return await this.pushSubscriptionService.subscribe({
      endpoint: dto.endpoint,
      keys: dto.keys,
    });
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('endpoint') endpoint: string) {
    await this.pushSubscriptionService.unsubscribe(endpoint);
    return { success: true };
  }
}
```

### 6. Integrar con NotificacionService

Modificar `packages/api/src/modules/notificacion/notificacion.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { Notificacion } from './entities/notificacion.entity';
import { Usuario } from '../auth/usuario/entities/usuario.entity';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Usuario]),
    PushModule,
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService],
})
export class NotificacionModule {}
```

Modificar `packages/api/src/modules/notificacion/notificacion.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { Usuario } from '../auth/usuario/entities/usuario.entity';
import { PushService } from '../push/push.service';
import { notaNotificacion } from '@/helpers/string';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private pushService: PushService,
  ) {}

  async create(dto: CreateNotificacionDto) {
    const notificacion = await this.notificacionRepository.save(dto);

    // Enviar push
    if (notificacion.usuarioDestinoId) {
      await this.enviarPush(notificacion);
    }

    return notificacion;
  }

  async notificarPorRoles(roles: number[], dto: CreateNotificacionDto) {
    const usuarios = await this.usuarioRepository.find({
      where: { roleId: In(roles) }
    });

    const notificaciones = usuarios.map((usuario) => ({
      ...dto,
      usuarioDestinoId: usuario.id
    }));

    const guardadas = await this.notificacionRepository.save(notificaciones);

    // Enviar push masivo
    const usuarioIds = usuarios.map(u => u.id);
    if (usuarioIds.length > 0) {
      await this.enviarPushMasivo(guardadas[0], usuarioIds);
    }

    return guardadas;
  }

  async notificarAUsuario(usuarioId: number, dto: CreateNotificacionDto) {
    const notificacion = {
      ...dto,
      usuarioDestinoId: usuarioId
    };

    const guardada = await this.notificacionRepository.save(notificacion);
    await this.enviarPush(guardada);

    return guardada;
  }

  private async enviarPush(notificacion: Notificacion): Promise<void> {
    try {
      await this.pushService.sendToUser({
        usuarioId: notificacion.usuarioDestinoId,
        title: this.obtenerTitulo(notificacion),
        body: notificacion.nota || notaNotificacion(notificacion),
        data: {
          tipo: notificacion.tipo,
          tipoId: notificacion.tipoId?.toString(),
          url: this.obtenerUrl(notificacion),
        },
        tag: `notificacion-${notificacion.id}`,
      });
    } catch (error) {
      console.error('Error enviando push:', error);
    }
  }

  private async enviarPushMasivo(notificacion: Notificacion, usuarioIds: number[]): Promise<void> {
    try {
      await this.pushService.sendToUsers({
        usuarioIds,
        title: this.obtenerTitulo(notificacion),
        body: notificacion.nota || notaNotificacion(notificacion),
        data: {
          tipo: notificacion.tipo,
          tipoId: notificacion.tipoId?.toString(),
          url: this.obtenerUrl(notificacion),
        },
      });
    } catch (error) {
      console.error('Error enviando push masivo:', error);
    }
  }

  private obtenerTitulo(notificacion: Notificacion): string {
    const titulos: Record<string, string> = {
      'mensaje': 'Nuevo mensaje',
      'solicitud_diseno': 'Solicitud de diseño',
      'mensaje_viapublica': 'Mensaje de vía pública',
      'propuesta_preparada': 'Propuesta preparada',
    };
    return titulos[notificacion.tipoNotificacion] || 'Nueva notificación';
  }

  private obtenerUrl(notificacion: Notificacion): string {
    if (!notificacion.tipo || !notificacion.tipoId) {
      return '/notificaciones';
    }

    const urlMap: Record<string, string> = {
      'presupuesto': `/presupuestos/${notificacion.tipoId}`,
      'solcom': `/solcom/${notificacion.tipoId}`,
      'mensaje': `/mensajes/${notificacion.tipoId}`,
    };

    return urlMap[notificacion.tipo] || '/notificaciones';
  }

  // ... resto de métodos (findAll, findOne, update, remove)
}
```

### 7. Importar en AppModule

Agregar `PushModule` a `packages/api/src/app.module.ts`:

```typescript
@Module({
  imports: [
    // ... otros módulos
    AfipModule,
    PushModule,  // ← Agregar aquí
    // ... resto
  ],
})
export class AppModule {}
```

### 8. Variables de Entorno

Agregar a `packages/api/.env`:

```env
# Microservicio Push
PUSH_HOST=localhost
```

## Microservicio Push (push-api)

Este microservicio es **stateless** y encapsula solo la lógica de envío:
- Configuración VAPID
- Envío de notificaciones Web Push
- **Sin base de datos** (recibe suscripciones vía TCP)

### 1. Crear Estructura

```bash
mkdir -p packages/push-api
cd packages/push-api
npm init -y
```

### 2. Instalar Dependencias

```bash
cd packages/push-api
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/microservices
npm install reflect-metadata rxjs web-push

npm install --save-dev @nestjs/cli @nestjs/schematics @nestjs/testing
npm install --save-dev @types/node @types/express @types/web-push typescript ts-node
```

### 3. Configuración TypeScript

Crear `packages/push-api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

Crear `packages/push-api/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

### 4. Configuración NestJS

Crear `packages/push-api/nest-cli.json`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false,
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

### 5. Package.json

Actualizar `packages/push-api/package.json`:

```json
{
  "name": "push-api",
  "version": "1.0.0",
  "description": "Microservicio stateless de notificaciones push",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^11.1.6",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.1.6",
    "@nestjs/microservices": "^11.1.6",
    "@nestjs/platform-express": "^11.1.6",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.10",
    "@nestjs/schematics": "^11.0.9",
    "@types/express": "^5.0.3",
    "@types/node": "^24.8.1",
    "@types/web-push": "^3.6.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

### 6. Variables de Entorno

Crear `packages/push-api/.env`:

```env
# Puerto del microservicio
PORT=5001

# Web Push VAPID Keys (generar con: npx web-push generate-vapid-keys)
WEB_PUSH_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
WEB_PUSH_PRIVATE_KEY=UUxI4O8-FXScn5895sSGzkQdkRvVcUL6TfOj4RLbTHo
WEB_PUSH_CONTACT_EMAIL=admin@pintegralco.com
WEB_PUSH_SUBJECT=https://crm.pintegralco.com
```

### 7. Servicio de Web Push

Crear `packages/push-api/src/web-push.service.ts`:

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as webPush from 'web-push';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebPushService implements OnModuleInit {
  private readonly logger = new Logger(WebPushService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const publicKey = this.configService.get<string>('WEB_PUSH_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('WEB_PUSH_PRIVATE_KEY');
    const subject = this.configService.get<string>('WEB_PUSH_SUBJECT');
    const contactEmail = this.configService.get<string>('WEB_PUSH_CONTACT_EMAIL');

    if (!publicKey || !privateKey) {
      this.logger.error('⚠️  VAPID keys no configuradas');
      return;
    }

    webPush.setVapidDetails(
      subject || `mailto:${contactEmail}`,
      publicKey,
      privateKey
    );

    this.logger.log('✅ Web Push configurado correctamente');
  }

  async sendNotification(
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    },
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      image?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
    }
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    try {
      const notificationPayload = JSON.stringify({
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          image: payload.image,
          tag: payload.tag,
          requireInteraction: payload.requireInteraction || false,
          vibrate: [200, 100, 200],
          data: payload.data || {},
        },
      });

      const result = await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        notificationPayload
      );

      return { success: true, statusCode: result.statusCode };
    } catch (error) {
      // Errores 404/410 indican suscripción expirada
      if (error.statusCode === 404 || error.statusCode === 410) {
        return {
          success: false,
          statusCode: error.statusCode,
          error: 'subscription_expired',
        };
      }

      return {
        success: false,
        statusCode: error.statusCode,
        error: error.message,
      };
    }
  }

  getPublicKey(): string {
    return this.configService.get<string>('WEB_PUSH_PUBLIC_KEY');
  }
}
```

### 8. Controlador del Microservicio

Crear `packages/push-api/src/push.controller.ts`:

```typescript
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WebPushService } from './web-push.service';

@Controller()
export class PushController {
  private readonly logger = new Logger(PushController.name);

  constructor(
    private readonly webPushService: WebPushService,
  ) {}

  @MessagePattern('push.getPublicKey')
  async getPublicKey() {
    this.logger.log('📥 Solicitada clave pública VAPID');
    return {
      publicKey: this.webPushService.getPublicKey(),
    };
  }

  @MessagePattern('push.send')
  async send(@Payload() data: {
    subscriptions: Array<{
      id: number;
      endpoint: string;
      keys: { p256dh: string; auth: string };
    }>;
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      image?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
    };
  }) {
    this.logger.log(`📥 Enviando push a ${data.subscriptions.length} suscripciones`);

    const successIds: number[] = [];
    const invalidIds: number[] = [];
    let successCount = 0;
    let failureCount = 0;

    const promises = data.subscriptions.map(async (sub) => {
      try {
        const result = await this.webPushService.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          data.notification
        );

        if (result.success) {
          successCount++;
          successIds.push(sub.id);
        } else {
          failureCount++;
          if (result.error === 'subscription_expired') {
            invalidIds.push(sub.id);
          }
        }
      } catch (error) {
        failureCount++;
        this.logger.error(`Error en suscripción ${sub.id}: ${error.message}`);
      }
    });

    await Promise.all(promises);

    this.logger.log(`✅ Push: ${successCount} ok, ${failureCount} fail`);

    return {
      success: true,
      successCount,
      failureCount,
      successSubscriptionIds: successIds,
      invalidSubscriptionIds: invalidIds,
    };
  }
}
```

### 9. Módulo Principal

Crear `packages/push-api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PushController } from './push.controller';
import { WebPushService } from './web-push.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [PushController],
  providers: [WebPushService],
})
export class AppModule {}
```

### 10. Bootstrap

Crear `packages/push-api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Iniciando Push Microservice (stateless)...');

  const port = parseInt(process.env.PORT || '5001', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: port,
        host: '0.0.0.0',
      },
    },
  );

  console.log(`📡 Push Microservice configurado en puerto ${port}`);
  await app.listen();
  console.log('✅ Push Microservice iniciado correctamente (sin DB, stateless)');
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar Push Microservice:', error);
  process.exit(1);
});
```

### 11. Actualizar package.json Raíz

Agregar en `package.json` de la raíz:

```json
{
  "workspaces": [
    "packages/api",
    "packages/front",
    "packages/afip-api",
    "packages/push-api"
  ],
  "scripts": {
    "dev": "npm run start:dev --workspace afip-api & npm run start:dev --workspace push-api & npm run start:dev --workspace api & npm run dev --workspace front",
    "dev:push": "npm run start:dev --workspace push-api",
    "build:push": "npm run build --workspace push-api",
    "start:push": "npm run start --workspace push-api"
  }
}
```

## Frontend - PWA con Next.js 15

### 1. Instalar Dependencias

```bash
cd packages/front
npm install @ducanh2912/next-pwa
```

### 2. Configurar next.config.js

```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  swSrc: 'service-worker.js',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... otras configuraciones
};

module.exports = withPWA(nextConfig);
```

### 3. Manifest PWA

Crear `packages/front/public/manifest.json`:

```json
{
  "name": "Pintegralco CRM",
  "short_name": "CRM",
  "description": "Sistema de gestión CRM",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4. Hook de Notificaciones

Crear `packages/front/src/hooks/use-push-notifications.tsx`:

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchClient } from '@/lib/fetch-client';
import { useToast } from '@/hooks/use-toast';

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const getDeviceInfo = () => ({
    userAgent: navigator.userAgent,
    browser: /Firefox/i.test(navigator.userAgent) ? 'Firefox' :
             /Edg/i.test(navigator.userAgent) ? 'Edge' :
             /Chrome/i.test(navigator.userAgent) ? 'Chrome' :
             /Safari/i.test(navigator.userAgent) ? 'Safari' : 'Unknown',
    os: /Win/i.test(navigator.userAgent) ? 'Windows' :
        /Mac/i.test(navigator.userAgent) ? 'macOS' :
        /Linux/i.test(navigator.userAgent) ? 'Linux' :
        /Android/i.test(navigator.userAgent) ? 'Android' : 'Unknown',
    isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
  });

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'No soportado',
        description: 'Tu navegador no soporta notificaciones push',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        toast({
          title: 'Permiso denegado',
          description: 'Necesitas permitir las notificaciones',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      const { publicKey } = await fetchClient('push/vapid-public-key', 'GET');

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      setSubscription(pushSubscription);

      const subscriptionData = pushSubscription.toJSON();
      await fetchClient('push/subscribe', 'POST', {
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        },
      });

      toast({
        title: 'Notificaciones activadas',
        description: 'Recibirás notificaciones push',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron activar las notificaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    setIsLoading(true);

    try {
      await subscription.unsubscribe();

      const subscriptionData = subscription.toJSON();
      await fetchClient('push/unsubscribe', 'POST', {
        endpoint: subscriptionData.endpoint,
      });

      setSubscription(null);

      toast({
        title: 'Notificaciones desactivadas',
        description: 'Ya no recibirás notificaciones push',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron desactivar las notificaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [subscription, toast]);

  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!isSupported || permissionStatus !== 'granted') return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription = await registration.pushManager.getSubscription();

        if (pushSubscription) {
          setSubscription(pushSubscription);
        }
      } catch (error) {
        console.error('Error verificando suscripción:', error);
      }
    };

    checkExistingSubscription();
  }, [isSupported, permissionStatus]);

  return {
    isSupported,
    permissionStatus,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
```

## Service Worker

Crear `packages/front/service-worker.js`:

```javascript
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const notification = data.notification || {};

    const title = notification.title || 'Nueva notificación';
    const options = {
      body: notification.body || '',
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/badge-72x72.png',
      tag: notification.tag || 'default',
      data: notification.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[SW] Error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/notificaciones';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
```

## Testing y Debugging

### 1. Generar Claves VAPID

```bash
cd packages/push-api
npx web-push generate-vapid-keys
```

Copiar las claves a `packages/push-api/.env`

### 2. Iniciar Servicios

```bash
# Desde la raíz
npm run dev
```

Iniciará:
- `afip-api` → Puerto 4001
- `push-api` → Puerto 5001 ✨
- `api` → Puerto 3001
- `front` → Puerto 3000

### 3. Flujo de Testing

1. **Frontend**: Activar notificaciones en configuración
2. **API**: Crear notificación (ej: nuevo presupuesto)
3. **Verificar logs**:
   - API: "Enviando push via microservicio"
   - push-api: "📥 Enviando push a X suscripciones"
   - push-api: "✅ Push: X ok, Y fail"
4. **Navegador**: Recibir notificación

## Deployment

### Docker Compose

Crear `docker-compose.yml`:

```yaml
version: '3.8'
services:
  push-api:
    build:
      context: ./packages/push-api
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
      - WEB_PUSH_PUBLIC_KEY=${WEB_PUSH_PUBLIC_KEY}
      - WEB_PUSH_PRIVATE_KEY=${WEB_PUSH_PRIVATE_KEY}

  api:
    build:
      context: ./packages/api
    ports:
      - "3001:3001"
    environment:
      - PUSH_MICROSERVICE_HOST=push-api
      - PUSH_MICROSERVICE_PORT=5001
    depends_on:
      - push-api
      - mysql

  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=pinte_crm
```

## Comandos Útiles

```bash
# Generar claves VAPID
cd packages/push-api
npx web-push generate-vapid-keys

# Desarrollo
npm run dev              # Todos los servicios
npm run dev:push         # Solo push-api

# Build
npm run build:push       # Build push-api

# Producción
npm run start:push       # Iniciar push-api
```

## Ventajas de Esta Arquitectura

1. **✅ Separación clara de responsabilidades**: API maneja datos, push-api maneja envío
2. **✅ Patrón AFIP Consistente**: Mismo patrón que el resto del proyecto
3. **✅ push-api stateless**: Sin base de datos, solo lógica de envío (escalable)
4. **✅ Escalabilidad**: push-api puede tener múltiples instancias sin conflictos
5. **✅ Resiliencia**: Fallo en push-api no afecta gestión de suscripciones
6. **✅ Mantenibilidad**: Cambios en push no afectan API principal
7. **✅ Sin Vendor Lock-in**: Código 100% propio, estándares web

## Resumen de la Implementación

### Lado API (Datos + Cliente TCP)

1. **Base de datos**: Tabla `push_subscription` + Entidad TypeORM
2. **PushSubscriptionService**: CRUD suscripciones en DB
3. **PushService**: Cliente TCP (patrón AFIP)
   - Busca suscripciones en DB
   - Envía suscripciones + notificación vía TCP
   - Actualiza estado según respuesta
4. **Controlador**: Endpoints públicos (`/push/subscribe`, `/push/vapid-public-key`)
5. **Módulo**: TypeORM + ClientsModule.register

**Total**: ~400 líneas de código

### Lado push-api (Stateless - Solo Envío)

1. **Sin base de datos** (stateless)
2. **WebPushService**: Configuración VAPID + envío web-push
3. **Controlador**:
   - `push.getPublicKey` - Retorna clave pública VAPID
   - `push.send` - Recibe suscripciones + notificación, envía push
4. **Módulo**: Solo ConfigModule
5. **Bootstrap**: Microservicio TCP

**Total**: ~200 líneas de código

### Frontend

1. **PWA**: next.config.js + manifest.json
2. **Hook**: `usePushNotifications()` - suscripción/desuscripción
3. **Service Worker**: Manejo de notificaciones push

## Próximos Pasos

1. ✅ Diseño de arquitectura (DB en API, envío en push-api)
2. ⏳ Generar claves VAPID (`npx web-push generate-vapid-keys`)
3. ⏳ Crear microservicio push-api stateless
4. ⏳ Crear PushModule con DB y cliente TCP en API
5. ⏳ Integrar con NotificacionService
6. ⏳ Implementar PWA en frontend
7. ⏳ Testing en desarrollo
8. ⏳ Generar iconos PWA
9. ⏳ Deploy a producción
