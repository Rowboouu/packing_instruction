import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadEvents, UploadEventsSchema } from './entities/upload-events';
import { UploadEventsController } from './upload-events.controller';
import { UploadEventsService } from './upload-events.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadEvents.name, schema: UploadEventsSchema },
    ]),
  ],
  providers: [UploadEventsService],
  controllers: [UploadEventsController],
})
export class UploadEventsModule {}
