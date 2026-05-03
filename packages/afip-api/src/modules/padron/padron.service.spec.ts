import { Test, TestingModule } from '@nestjs/testing';
import { PadronService } from './padron.service';

describe('PadronService', () => {
  let service: PadronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PadronService],
    }).compile();

    service = module.get<PadronService>(PadronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
