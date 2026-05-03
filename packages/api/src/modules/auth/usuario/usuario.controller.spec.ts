import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../guards/api-key/api-key.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  const mockUsuarioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: mockUsuarioService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(ApiKeyGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
