import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTemplatesController } from './customer-templates.controller';
import { CustomerTemplatesService } from './customer-templates.service';

describe('CustomerTemplatesController', () => {
  let controller: CustomerTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerTemplatesController],
      providers: [CustomerTemplatesService],
    }).compile();

    controller = module.get<CustomerTemplatesController>(
      CustomerTemplatesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
