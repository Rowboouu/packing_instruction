import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from 'src/files/files.module';
import { RetakesModule } from 'src/retakes/retakes.module';
import { PcfImage, PcfImageSchema } from './entities/pcf-image.entity';
import { PcfImagesController } from './pcf-images.controller';
import { PcfImagesService } from './pcf-images.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PcfImage.name, schema: PcfImageSchema },
    ]),
    FilesModule,
    RetakesModule,
  ],
  controllers: [PcfImagesController],
  providers: [PcfImagesService],
  exports: [PcfImagesService],
})
export class PcfImagesModule {}
