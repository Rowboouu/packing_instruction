import { BadRequestException, Injectable } from '@nestjs/common';
import { GCExcelReportsService } from './gc-excel-reports.service';
import { GCPdfRerportsService } from './gc-pdf-reports.service';

@Injectable()
export class ReportsService {
  constructor(
    private gcExcelReportsService: GCExcelReportsService,
    private gcPdfReportsService: GCPdfRerportsService,
  ) {}

  async generateReport(itemId: string, reportType: string) {
    switch (reportType) {
      case 'pdf': {
        return this.gcPdfReportsService.createReport(itemId);
      }
      case 'excel': {
        return this.gcExcelReportsService.createReport(itemId);
      }
      default:
        throw new BadRequestException('Invalid report type');
    }
  }
}
