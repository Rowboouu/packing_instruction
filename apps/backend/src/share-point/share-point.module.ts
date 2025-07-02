import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ZuluAssortmentsModule } from 'src/zulu-assortments/zulu-assortments.module';
import { ZuluSalesOrdersModule } from 'src/zulu-sales-orders/zulu-sales-orders.module';
import { SharePointController } from './share-point.controller';
import { SharePointService } from './share-point.service';

@Module({
  imports: [
    HttpModule.register({}),
    ZuluAssortmentsModule,
    ZuluSalesOrdersModule,
    AuthModule,
  ],
  providers: [SharePointService],
  exports: [SharePointService],
  controllers: [SharePointController],
})
export class SharePointModule {}
