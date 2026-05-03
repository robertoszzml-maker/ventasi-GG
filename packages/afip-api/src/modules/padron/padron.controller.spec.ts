import { Test, TestingModule } from '@nestjs/testing';
import { PadronController } from './padron.controller';
import { PadronService } from './padron.service';

describe('PadronController', () => {
  let controller: PadronController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PadronController],
      providers: [PadronService],
    }).compile();

    controller = module.get<PadronController>(PadronController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
