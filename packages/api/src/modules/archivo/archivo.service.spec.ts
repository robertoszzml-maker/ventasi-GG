import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArchivoService } from './archivo.service';
import { Archivo } from './entities/archivo.entity';

describe('ArchivoService', () => {
  let service: ArchivoService;

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
        ArchivoService,
        { provide: getRepositoryToken(Archivo), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ArchivoService>(ArchivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
