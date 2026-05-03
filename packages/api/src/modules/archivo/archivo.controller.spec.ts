import { Test, TestingModule } from '@nestjs/testing';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';

describe('ArchivoController', () => {
  let controller: ArchivoController;

  const mockArchivoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    download: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivoController],
      providers: [{ provide: ArchivoService, useValue: mockArchivoService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(ApiKeyGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ArchivoController>(ArchivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
