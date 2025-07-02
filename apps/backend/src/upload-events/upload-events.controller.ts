import { Controller, Get, Query } from '@nestjs/common';
import { QueryParamsDto } from 'src/common/pagination/pagination-query.dto';
import { UploadEventsService } from './upload-events.service';

@Controller('upload-events')
export class UploadEventsController {
  constructor(private readonly uploadEventsService: UploadEventsService) {}

  @Get()
  findAll(@Query() query: QueryParamsDto) {
    return this.uploadEventsService.findAll(query.page, query.limit);
  }
}
