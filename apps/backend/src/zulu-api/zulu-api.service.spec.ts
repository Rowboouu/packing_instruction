import { Test, TestingModule } from '@nestjs/testing';
import { ZuluApiService } from './zulu-api.service';

describe('ZuluApiService', () => {
  let service: ZuluApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZuluApiService],
    }).compile();

    service = module.get<ZuluApiService>(ZuluApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
