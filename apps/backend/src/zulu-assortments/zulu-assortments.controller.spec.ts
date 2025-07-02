import { Test, TestingModule } from '@nestjs/testing';
import { ZuluAssortmentsController } from './zulu-assortments.controller';
import { ZuluAssortmentsService } from './zulu-assortments.service';

describe('ZuluAssortmentsController', () => {
  let controller: ZuluAssortmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZuluAssortmentsController],
      providers: [ZuluAssortmentsService],
    }).compile();

    controller = module.get<ZuluAssortmentsController>(
      ZuluAssortmentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
