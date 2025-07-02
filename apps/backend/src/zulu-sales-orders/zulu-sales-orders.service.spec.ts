import { Test, TestingModule } from '@nestjs/testing';
import { ZuluSalesOrdersService } from './zulu-sales-orders.service';

describe('ZuluSalesOrdersService', () => {
  let service: ZuluSalesOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZuluSalesOrdersService],
    }).compile();

    service = module.get<ZuluSalesOrdersService>(ZuluSalesOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
