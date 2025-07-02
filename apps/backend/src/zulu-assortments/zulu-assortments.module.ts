import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PcfImagesModule } from 'src/pcf-images/pcf-images.module';
import { ZuluSalesOrdersModule } from 'src/zulu-sales-orders/zulu-sales-orders.module';
import {
  ZuluAssortment,
  ZuluAssortmentSchema,
} from './entities/zulu-assortment.entity';
import { ZuluAssortmentsController } from './zulu-assortments.controller';
import { ZuluAssortmentsService } from './zulu-assortments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ZuluAssortment.name, schema: ZuluAssortmentSchema },
    ]),
    PcfImagesModule,
    ZuluSalesOrdersModule,
  ],
  controllers: [ZuluAssortmentsController],
  providers: [ZuluAssortmentsService],
  exports: [ZuluAssortmentsService],
})
export class ZuluAssortmentsModule {}
