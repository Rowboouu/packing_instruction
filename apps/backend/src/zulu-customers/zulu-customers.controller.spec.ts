import { Test, TestingModule } from '@nestjs/testing';
import { ZuluCustomersController } from './zulu-customers.controller';
import { ZuluCustomersService } from './zulu-customers.service';

describe('ZuluCustomersController', () => {
  let controller: ZuluCustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZuluCustomersController],
      providers: [ZuluCustomersService],
    }).compile();

    controller = module.get<ZuluCustomersController>(ZuluCustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
