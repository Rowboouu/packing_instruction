import { Test, TestingModule } from '@nestjs/testing';
import { UploadEventsService } from './upload-events.service';

describe('UploadEventsService', () => {
  let service: UploadEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadEventsService],
    }).compile();

    service = module.get<UploadEventsService>(UploadEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
