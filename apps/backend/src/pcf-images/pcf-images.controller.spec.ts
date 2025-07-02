import { Test, TestingModule } from '@nestjs/testing';
import { PcfImagesController } from './pcf-images.controller';
import { PcfImagesService } from './pcf-images.service';

describe('PcfImagesController', () => {
  let controller: PcfImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcfImagesController],
      providers: [PcfImagesService],
    }).compile();

    controller = module.get<PcfImagesController>(PcfImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
