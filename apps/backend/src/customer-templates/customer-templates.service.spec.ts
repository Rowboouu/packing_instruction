import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTemplatesService } from './customer-templates.service';

describe('CustomerTemplatesService', () => {
  let service: CustomerTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerTemplatesService],
    }).compile();

    service = module.get<CustomerTemplatesService>(CustomerTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
