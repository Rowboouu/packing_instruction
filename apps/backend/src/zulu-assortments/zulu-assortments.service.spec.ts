import { Test, TestingModule } from '@nestjs/testing';
import { ZuluAssortmentsService } from './zulu-assortments.service';

describe('ZuluAssortmentsService', () => {
  let service: ZuluAssortmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZuluAssortmentsService],
    }).compile();

    service = module.get<ZuluAssortmentsService>(ZuluAssortmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
