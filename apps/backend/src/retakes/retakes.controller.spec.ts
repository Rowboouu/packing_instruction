import { Test, TestingModule } from '@nestjs/testing';
import { RetakesController } from './retakes.controller';

describe('RetakesController', () => {
  let controller: RetakesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetakesController],
    }).compile();

    controller = module.get<RetakesController>(RetakesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
