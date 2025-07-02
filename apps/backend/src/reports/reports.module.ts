import { Module } from '@nestjs/common';
import { ClusterModule } from 'src/cluster/cluster.module';
import { CustomerTemplatesModule } from 'src/customer-templates/customer-templates.module';
import { FilesModule } from 'src/files/files.module';
import { TemplatesModule } from 'src/templates/templates.module';
import { ZuluAssortmentsModule } from 'src/zulu-assortments/zulu-assortments.module';
import { ZuluSalesOrdersModule } from 'src/zulu-sales-orders/zulu-sales-orders.module';
import { GCExcelReportsService } from './gc-excel-reports.service';
import { GCPdfRerportsService } from './gc-pdf-reports.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TemplatesModule,
    FilesModule,
    ZuluAssortmentsModule,
    CustomerTemplatesModule,
    ZuluSalesOrdersModule,
    ClusterModule,
  ],
  controllers: [ReportsController],
  providers: [GCExcelReportsService, GCPdfRerportsService, ReportsService],
})
export class ReportsModule {}
