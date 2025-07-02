import { Test, TestingModule } from '@nestjs/testing';
import { UploadEventsController } from './upload-events.controller';

describe('UploadEventsController', () => {
  let controller: UploadEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadEventsController],
    }).compile();

    controller = module.get<UploadEventsController>(UploadEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
