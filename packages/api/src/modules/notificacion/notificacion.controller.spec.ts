import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';

describe('NotificacionController', () => {
  let controller: NotificacionController;

  const mockNotificacionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionController],
      providers: [{ provide: NotificacionService, useValue: mockNotificacionService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(ApiKeyGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificacionController>(NotificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
