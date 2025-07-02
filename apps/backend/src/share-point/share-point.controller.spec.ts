import { Test, TestingModule } from '@nestjs/testing';
import { SharePointController } from './share-point.controller';

describe('SharePointController', () => {
  let controller: SharePointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharePointController],
    }).compile();

    controller = module.get<SharePointController>(SharePointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
