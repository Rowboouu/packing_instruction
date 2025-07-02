import { Test, TestingModule } from '@nestjs/testing';
import { ZuluSalesOrdersController } from './zulu-sales-orders.controller';
import { ZuluSalesOrdersService } from './zulu-sales-orders.service';

describe('ZuluSalesOrdersController', () => {
  let controller: ZuluSalesOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZuluSalesOrdersController],
      providers: [ZuluSalesOrdersService],
    }).compile();

    controller = module.get<ZuluSalesOrdersController>(
      ZuluSalesOrdersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
