import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ZuluSalesOrder,
  ZuluSalesOrderSchema,
} from './entities/zulu-sales-order.entity';
import { ZuluSalesOrdersController } from './zulu-sales-orders.controller';
import { ZuluSalesOrdersService } from './zulu-sales-orders.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ZuluSalesOrder.name, schema: ZuluSalesOrderSchema },
    ]),
  ],
  controllers: [ZuluSalesOrdersController],
  providers: [ZuluSalesOrdersService],
  exports: [ZuluSalesOrdersService],
})
export class ZuluSalesOrdersModule {}
