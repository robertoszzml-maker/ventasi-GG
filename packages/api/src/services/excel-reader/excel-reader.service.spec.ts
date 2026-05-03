import { Test, TestingModule } from '@nestjs/testing';
import { ExcelReaderService } from './excel-reader.service';

describe('ExcelReaderService', () => {
  let service: ExcelReaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelReaderService],
    }).compile();

    service = module.get<ExcelReaderService>(ExcelReaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
