import { Test, TestingModule } from '@nestjs/testing';
import { RetakesService } from './retakes.service';

describe('RetakesService', () => {
  let service: RetakesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetakesService],
    }).compile();

    service = module.get<RetakesService>(RetakesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
