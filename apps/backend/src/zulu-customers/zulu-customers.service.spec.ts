import { Test, TestingModule } from '@nestjs/testing';
import { ZuluCustomersService } from './zulu-customers.service';

describe('ZuluCustomersService', () => {
  let service: ZuluCustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZuluCustomersService],
    }).compile();

    service = module.get<ZuluCustomersService>(ZuluCustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
