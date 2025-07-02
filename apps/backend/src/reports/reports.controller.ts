import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GCPdfRerportsService } from './gc-pdf-reports.service';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private pdfService: GCPdfRerportsService,
  ) {}

  @Get('item/:itemId')
  async generateReport(
    @Query('report-type') reportType: string,
    @Param('itemId') itemId: string,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.generateReport(itemId, reportType);

    res.set({
      'Content-Type': report.mimetype,
      'Content-Disposition': `attachment; filename="${report.fileName}"`,
    });

    res.send(report.buffer);
  }

  @Get('preview/:itemId')
  async previewReport(@Param('itemId') itemId: string) {
    return this.pdfService.createHtml(itemId);
  }
}
