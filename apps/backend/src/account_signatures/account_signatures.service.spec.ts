import { Test, TestingModule } from '@nestjs/testing';
import { AccountSignaturesService } from './account_signatures.service';

describe('AccountSignaturesService', () => {
  let service: AccountSignaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountSignaturesService],
    }).compile();

    service = module.get<AccountSignaturesService>(AccountSignaturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
