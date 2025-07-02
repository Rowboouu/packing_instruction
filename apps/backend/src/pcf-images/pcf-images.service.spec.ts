import { Test, TestingModule } from '@nestjs/testing';
import { PcfImagesService } from './pcf-images.service';

describe('PcfImagesService', () => {
  let service: PcfImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcfImagesService],
    }).compile();

    service = module.get<PcfImagesService>(PcfImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
