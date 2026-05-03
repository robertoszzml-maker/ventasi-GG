import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MensajeService } from './mensaje.service';
import { Mensaje } from './entities/mensaje.entity';
import { Archivo } from '../archivo/entities/archivo.entity';
import { Notificacion } from '../notificacion/entities/notificacion.entity';

describe('MensajeService', () => {
  let service: MensajeService;

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
        MensajeService,
        { provide: getRepositoryToken(Mensaje), useValue: mockRepository },
        { provide: getRepositoryToken(Archivo), useValue: mockRepository },
        { provide: getRepositoryToken(Notificacion), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MensajeService>(MensajeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
