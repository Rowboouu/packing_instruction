import { Test, TestingModule } from '@nestjs/testing';
import { AccountSignaturesController } from './account_signatures.controller';

describe('AccountSignaturesController', () => {
  let controller: AccountSignaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountSignaturesController],
    }).compile();

    controller = module.get<AccountSignaturesController>(
      AccountSignaturesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
