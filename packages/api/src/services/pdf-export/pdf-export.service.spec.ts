import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PdfExportService } from './pdf-export.service';

describe('PdfExportService', () => {
  let service: PdfExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfExportService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<PdfExportService>(PdfExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
