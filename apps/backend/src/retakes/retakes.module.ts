import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Retake, RetakeSchema } from './entities/retake.entity';
import { RetakesGateway } from './retakes.gateway';
import { RetakesService } from './retakes.service';
import { RetakesController } from './retakes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Retake.name, schema: RetakeSchema }]),
  ],
  providers: [RetakesGateway, RetakesService],
  exports: [RetakesService],
  controllers: [RetakesController],
})
export class RetakesModule {}
