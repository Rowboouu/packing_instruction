import { Test, TestingModule } from '@nestjs/testing';
import { RetakesGateway } from './retakes.gateway';
import { RetakesService } from './retakes.service';

describe('RetakesGateway', () => {
  let gateway: RetakesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetakesGateway, RetakesService],
    }).compile();

    gateway = module.get<RetakesGateway>(RetakesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
