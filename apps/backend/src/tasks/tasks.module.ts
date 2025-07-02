import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';
import { SeedersModule } from 'src/seeders/seeders.module';
import { ZuluApiModule } from 'src/zulu-api/zulu-api.module';
import { ZuluAssortmentsModule } from 'src/zulu-assortments/zulu-assortments.module';
import { ZuluSalesOrdersModule } from 'src/zulu-sales-orders/zulu-sales-orders.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ZuluApiModule,
    ZuluSalesOrdersModule,
    ZuluAssortmentsModule,
    FilesModule,
    SeedersModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
