import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';
import { ZuluApiModule } from 'src/zulu-api/zulu-api.module';
import { ZuluAssortmentsModule } from 'src/zulu-assortments/zulu-assortments.module';
import { ZuluSalesOrdersModule } from 'src/zulu-sales-orders/zulu-sales-orders.module';
import { SeedersController } from './seeders.controller';
import { SeedersService } from './seeders.service';

@Module({
  imports: [
    ZuluApiModule,
    ZuluSalesOrdersModule,
    ZuluAssortmentsModule,
    FilesModule,
  ],
  controllers: [SeedersController],
  providers: [SeedersService],
  exports: [SeedersService],
})
export class SeedersModule {}
