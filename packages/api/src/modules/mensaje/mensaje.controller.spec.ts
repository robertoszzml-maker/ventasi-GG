import { Test, TestingModule } from '@nestjs/testing';
import { MensajeController } from './mensaje.controller';
import { MensajeService } from './mensaje.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';

describe('MensajeController', () => {
  let controller: MensajeController;

  const mockMensajeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MensajeController],
      providers: [{ provide: MensajeService, useValue: mockMensajeService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(ApiKeyGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MensajeController>(MensajeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
