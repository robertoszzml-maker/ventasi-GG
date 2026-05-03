import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificacionService } from './notificacion.service';
import { Notificacion } from './entities/notificacion.entity';
import { Usuario } from '../auth/usuario/entities/usuario.entity';

describe('NotificacionService', () => {
  let service: NotificacionService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionService,
        { provide: getRepositoryToken(Notificacion), useValue: mockRepository },
        { provide: getRepositoryToken(Usuario), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NotificacionService>(NotificacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
